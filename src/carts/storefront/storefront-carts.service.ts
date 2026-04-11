import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import {
  AddToCartDto,
  CartCreateEntityInput,
  CartItemCreateEntityInput,
  CartItemUpdateEntityInput,
  CartUpdateEntityDto,
  ResolveCartDto,
} from './dto';
import { CartItemMapper, CartMapper } from './mappers';
import {
  CART_REPOSITORY,
  type ICartRepository,
  CART_ITEM_REPOSITORY,
  type ICartItemRepository,
} from '../repositories';
import { GUEST } from '@/common/constants';
import { ProductVariantStockStatus } from '@/common/enums';
import {
  getErrorStack,
  isUniqueConstraintError,
  sanitizeEntityInput,
} from '@/common/utils';
import { ProductVariant } from '@/product-variants/entities/product-variant.entity';
import { ProductVariantsService } from '@/product-variants/product-variants.service';

dayjs.extend(utc);

@Injectable()
export class StorefrontCartsService {
  private readonly logger = new Logger(StorefrontCartsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(CART_ITEM_REPOSITORY)
    private readonly cartItemRepository: ICartItemRepository,
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  async resolve(resolveCartDto: ResolveCartDto) {
    const { customerId, sessionId } = resolveCartDto;
    const actor = this.getActor(customerId);

    this.logger.debug(
      `[resolve] Resolving cart sessionId=${sessionId}, customerId=${customerId}`,
    );

    try {
      let cart = await this.cartRepository.findOneActiveByCustomerIdOrSessionId(
        {
          customerId,
          sessionId,
        },
      );

      if (!cart) {
        const newSessionId = uuid();

        this.logger.debug(
          `[resolve] No existing cart found, creating new cart sessionId=${newSessionId}, customerId=${customerId}`,
        );

        cart = await this.cartRepository.create(
          sanitizeEntityInput(CartCreateEntityInput, {
            ...resolveCartDto,
            sessionId: newSessionId,
            createdBy: actor,
            expiresAt: this.getNewExpiryDate(),
          }),
        );
      } else {
        cart.expiresAt = this.getNewExpiryDate();
        cart.updatedBy = actor;

        this.logger.log(
          `[resolve] Updating existing cart: id=${cart.id}, sessionId=${sessionId}, customerId=${customerId}`,
        );

        await this.cartRepository.update(
          cart.id,
          sanitizeEntityInput(CartUpdateEntityDto, cart),
        );
      }

      this.logger.log(
        `[resolve] Resolved cart success sessionId=${cart.sessionId}, customerId=${customerId}`,
      );

      return this.findOne(cart.id);
    } catch (error) {
      this.logger.error(
        `[resolve] An error occurred when resolving cart sessionId=${sessionId}, customerId=${customerId}`,
        getErrorStack(error),
      );

      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Cart already exists');
      }

      throw error;
    }
  }

  async addToCart(cartId: string, addToCartDto: AddToCartDto) {
    const { customerId, quantity, variantId } = addToCartDto;
    const actor = this.getActor(customerId);

    this.logger.debug(
      `[addToCart] Adding item to cart cartId=${cartId}, variantId=${variantId}, quantity=${quantity}`,
    );

    const cartItemId = await this.dataSource.transaction(async (tx) => {
      const [cart, variant, existingCartItem] = await Promise.all([
        this.cartRepository.findOneActiveById(cartId, tx),
        this.productVariantsService.findOneActiveById(variantId, tx),
        this.cartItemRepository.findOneActiveByCartIdAndVariantId({
          cartId,
          variantId,
          tx,
        }),
      ]);

      if (!cart) throw new NotFoundException('Cart not found');
      if (!variant) throw new NotFoundException('Product variant not found');

      const newQuantity = existingCartItem
        ? existingCartItem.quantity + quantity
        : quantity;

      this.validateStock(variant, newQuantity);

      let cartItemId: string;
      if (existingCartItem) {
        this.logger.debug(
          `[addToCart] Updating existing item itemId=${existingCartItem.id}, newQuantity=${newQuantity}`,
        );

        existingCartItem.quantity = newQuantity;
        existingCartItem.updatedBy = actor;

        await this.cartItemRepository.update(
          existingCartItem.id,
          sanitizeEntityInput(CartItemUpdateEntityInput, existingCartItem),
        );

        cartItemId = existingCartItem.id;
      } else {
        this.logger.debug(
          `[addToCart] Creating new item cartId=${cartId}, variantId=${variantId}, quantity=${quantity}`,
        );

        const inputEntity = sanitizeEntityInput(CartItemCreateEntityInput, {
          cartId,
          variantId,
          quantity: newQuantity,
          createdBy: actor,
        });

        const cartItem = await this.cartItemRepository.create(inputEntity);

        cartItemId = cartItem.id;
      }

      cart.updatedBy = actor;

      await this.cartRepository.update(
        cartId,
        sanitizeEntityInput(CartUpdateEntityDto, cart),
      );

      this.logger.debug(
        `[addToCart] Added item to cart success cartId=${cartId}, variantId=${variantId}, quantity=${quantity}`,
      );

      return cartItemId;
    });

    return this.findCartItemById(cartItemId);
  }

  async updateItemQuantity(
    cartId: string,
    itemId: string,
    type: 'increase' | 'decrease',
  ) {
    this.logger.debug(
      `[updateItemQuantity] Updating cart item quantity cartId=${cartId}, itemId=${itemId}, type=${type}`,
    );

    const cartItem = await this.cartItemRepository.findOneActiveById(itemId);

    if (!cartItem) throw new NotFoundException('Cart item not found');

    const [cart, variant] = await Promise.all([
      this.cartRepository.findOneActiveById(cartId),
      this.productVariantsService.findOneActiveById(cartItem.variantId),
    ]);

    if (!cart) throw new NotFoundException('Cart not found');

    if (!variant) throw new NotFoundException('Variant not found');

    if (type === 'increase') {
      this.validateStock(variant, cartItem.quantity + 1);
      cartItem.quantity += 1;
    } else {
      cartItem.quantity -= 1;

      if (cartItem.quantity <= 0) {
        this.logger.debug(
          `[updateItemQuantity] Removing item itemId=${itemId}`,
        );
        cartItem.isActive = false;
        cartItem.quantity = 0;
      }
    }

    await this.cartItemRepository.update(
      itemId,
      sanitizeEntityInput(CartItemUpdateEntityInput, cartItem),
    );

    return true;
  }

  async removeCartItem(id: string) {
    this.logger.debug(`[removeCartItem] Removing cart item id=${id}`);

    const updated = await this.cartItemRepository.update(id, {
      isActive: false,
    } as CartItemUpdateEntityInput);

    if (!updated) {
      throw new NotFoundException('Cart item not found');
    }

    this.logger.debug(`[removeCartItem] Removed cart item id=${id}`);

    return true;
  }

  private async findOne(id: string) {
    const cart = await this.cartRepository.findStorefrontCartById(id);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return CartMapper.mapToCartResponse(cart);
  }

  private async findCartItemById(id: string) {
    const result = await this.cartItemRepository.findStorefrontCartItemById(id);

    if (!result) throw new NotFoundException('Cart item not found');

    return CartItemMapper.mapToCartItemResponse(result);
  }

  private getActor(customerId: string | undefined) {
    return customerId ?? GUEST;
  }

  private getNewExpiryDate(): Date {
    return dayjs().utc().add(7, 'day').toDate();
  }

  private validateStock(variant: ProductVariant, quantity: number) {
    if (
      variant.stockStatus === ProductVariantStockStatus.OUT_OF_STOCK ||
      variant.stockQuantity < quantity
    ) {
      throw new BadRequestException('Not enough stock for this product');
    }
  }
}
