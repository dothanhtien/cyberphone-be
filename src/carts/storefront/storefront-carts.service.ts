import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../entities/cart.entity';
import { sanitizeEntityInput } from '@/common/utils/entities';
import { CartCreateEntityInput } from './dto/entity-inputs/cart-create-entity.dto';
import { ResolveCartDto } from './dto/requests/resolve-cart.dto';
import { AddToCartDto } from './dto/requests/add-to-cart.dto';
import { ProductVariant } from '@/product-variants/entities/product-variant.entity';
import { CartItem } from '../entities/cart-item.entity';
import { CartItemCreateEntityInput } from './dto/entity-inputs/cart-item-create-entity.dto';
import { ProductVariantStockStatus } from '@/common/enums';

dayjs.extend(utc);

@Injectable()
export class StorefrontCartsService {
  private readonly logger = new Logger(StorefrontCartsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async resolve(resolveCartDto: ResolveCartDto) {
    const { userId, sessionId } = resolveCartDto;

    return this.dataSource.transaction(async (tx) => {
      let cart: Cart;

      try {
        cart = await this.getCartByUserOrSession(resolveCartDto);

        cart.expiresAt = this.getNewExpiryDate();
        cart.updatedBy = userId ?? 'guest';

        this.logger.log(
          `Updating existing cart: id=${cart.id}, userId=${userId}, sessionId=${sessionId}`,
        );

        await tx.save(cart);
      } catch (err) {
        if (!(err instanceof NotFoundException)) throw err;
        this.logger.log(
          `No existing cart found, creating new cart for userId=${userId}, sessionId=${sessionId}`,
        );

        resolveCartDto.sessionId = sessionId ?? uuid();

        const entityInput = sanitizeEntityInput(CartCreateEntityInput, {
          ...resolveCartDto,
          createdBy: userId ?? 'guest',
          expiresAt: this.getNewExpiryDate(),
        });

        cart = await tx.save(Cart, entityInput);
      }

      return tx.getRepository(Cart).findOne({
        where: { id: cart.id, isActive: true },
        relations: ['items'],
      });
    });
  }

  async addToCart(cartId: string, addToCartDto: AddToCartDto) {
    return this.dataSource.transaction(async (tx) => {
      const cartRepository = tx.getRepository(Cart);
      const cartItemRepository = tx.getRepository(CartItem);
      const variantRepository = tx.getRepository(ProductVariant);

      const [cart, variant, existingCartItem] = await Promise.all([
        cartRepository.findOne({ where: { id: cartId, isActive: true } }),
        variantRepository.findOne({
          where: { id: addToCartDto.variantId, isActive: true },
        }),
        cartItemRepository.findOne({
          where: {
            cartId,
            variantId: addToCartDto.variantId,
            isActive: true,
          },
        }),
      ]);

      if (!cart) throw new NotFoundException('Cart not found');
      if (!variant) throw new NotFoundException('Product variant not found');

      const newQuantity = existingCartItem
        ? existingCartItem.quantity + addToCartDto.quantity
        : addToCartDto.quantity;

      if (
        variant.stockStatus === ProductVariantStockStatus.OUT_OF_STOCK ||
        variant.stockQuantity < newQuantity
      ) {
        throw new BadRequestException('Not enough stock for this product');
      }

      let savedCartItem: CartItem;
      if (existingCartItem) {
        existingCartItem.quantity = newQuantity;
        existingCartItem.updatedBy = addToCartDto.userId ?? 'guest';
        savedCartItem = await cartItemRepository.save(existingCartItem);
      } else {
        const inputEntity = sanitizeEntityInput(CartItemCreateEntityInput, {
          cartId,
          variantId: addToCartDto.variantId,
          quantity: newQuantity,
          createdBy: addToCartDto.userId ?? 'guest',
        });
        savedCartItem = await cartItemRepository.save(inputEntity);
      }

      cart.updatedBy = addToCartDto.userId ?? 'guest';
      await cartRepository.save(cart);

      return savedCartItem;
    });
  }

  async getCartByUserOrSession({
    userId,
    sessionId,
  }: {
    userId?: string;
    sessionId?: string;
  }): Promise<Cart> {
    const now = new Date();

    if (userId) {
      const userCart = await this.cartRepository.findOne({
        where: { userId, isActive: true },
      });

      if (userCart) {
        if (userCart.expiresAt && userCart.expiresAt < now) {
          await this.cartRepository.update(userCart.id, {
            isActive: false,
          });
        } else {
          return userCart;
        }
      }
    }

    if (sessionId) {
      const guestCart = await this.cartRepository.findOne({
        where: {
          sessionId,
          isActive: true,
          expiresAt: MoreThan(now),
        },
      });

      if (guestCart) return guestCart;
    }

    throw new NotFoundException('Cart not found');
  }

  private getNewExpiryDate(): Date {
    return dayjs().utc().add(7, 'day').toDate();
  }
}
