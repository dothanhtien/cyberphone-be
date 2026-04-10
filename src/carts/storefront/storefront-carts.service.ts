import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  AddToCartDto,
  CartCreateEntityInput,
  CartItemCreateEntityInput,
  ResolveCartDto,
} from './dto';
import { Cart, CartItem } from '../entities';
import { CartStatus } from '../enums';
import {
  MediaAssetRefType,
  MediaAssetUsageType,
  ProductVariantStockStatus,
} from '@/common/enums';
import { sanitizeEntityInput } from '@/common/utils';
import { ProductVariant } from '@/product-variants/entities/product-variant.entity';

dayjs.extend(utc);

@Injectable()
export class StorefrontCartsService {
  private readonly logger = new Logger(StorefrontCartsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async resolve(resolveCartDto: ResolveCartDto) {
    const { userId, sessionId } = resolveCartDto;

    const cart = await this.dataSource.transaction(async (tx) => {
      try {
        const cart = await this.getCartByUserOrSession(resolveCartDto);

        cart.expiresAt = this.getNewExpiryDate();
        cart.updatedBy = userId ?? 'guest';

        this.logger.log(
          `Updating existing cart: id=${cart.id}, userId=${userId}, sessionId=${sessionId}`,
        );

        return await tx.save(cart);
      } catch (err) {
        if (!(err instanceof NotFoundException)) throw err;
        this.logger.log(
          `No existing cart found, creating new cart for userId=${userId}, sessionId=${sessionId}`,
        );

        resolveCartDto.sessionId = uuid();

        const entityInput = sanitizeEntityInput(CartCreateEntityInput, {
          ...resolveCartDto,
          createdBy: userId ?? 'guest',
          expiresAt: this.getNewExpiryDate(),
        });

        return await tx.save(Cart, entityInput);
      }
    });

    return this.findOne(cart.id);
  }

  async addToCart(cartId: string, addToCartDto: AddToCartDto) {
    const cartItem = await this.dataSource.transaction(async (tx) => {
      const cartRepository = tx.getRepository(Cart);
      const cartItemRepository = tx.getRepository(CartItem);
      const variantRepository = tx.getRepository(ProductVariant);

      const [cart, variant, existingCartItem] = await Promise.all([
        cartRepository.findOne({
          where: {
            id: cartId,
            status: CartStatus.ACTIVE,
            expiresAt: MoreThan(new Date()),
          },
        }),
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

      if (!cart) throw new NotFoundException('Cart not found or expired');
      if (!variant) throw new NotFoundException('Product variant not found');

      const newQuantity = existingCartItem
        ? existingCartItem.quantity + addToCartDto.quantity
        : addToCartDto.quantity;

      if (
        variant.stockStatus === 'out_of_stock' ||
        variant.stockQuantity < newQuantity
      ) {
        throw new BadRequestException('Not enough stock for this product');
      }

      let cartItem: CartItem;
      if (existingCartItem) {
        existingCartItem.quantity = newQuantity;
        existingCartItem.updatedBy = addToCartDto.userId ?? 'guest';
        cartItem = await cartItemRepository.save(existingCartItem);
      } else {
        const inputEntity = sanitizeEntityInput(CartItemCreateEntityInput, {
          cartId,
          variantId: addToCartDto.variantId,
          quantity: newQuantity,
          createdBy: addToCartDto.userId ?? 'guest',
        });
        cartItem = await cartItemRepository.save(inputEntity);
      }

      cart.updatedBy = addToCartDto.userId ?? 'guest';
      await cartRepository.save(cart);

      return cartItem;
    });

    return this.findCartItemById(cartItem.id);
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
        where: { userId, status: CartStatus.ACTIVE },
      });

      if (userCart) {
        if (userCart.expiresAt && userCart.expiresAt < now) {
          await this.cartRepository.update(userCart.id, {
            status: CartStatus.INACTIVE,
          });
        } else {
          return userCart;
        }
      }
    }

    if (sessionId) {
      const guestCart = await this.cartRepository.findOne({
        where: { sessionId, status: CartStatus.ACTIVE },
      });

      if (guestCart) {
        if (guestCart.expiresAt && guestCart.expiresAt < now) {
          await this.cartRepository.update(guestCart.id, {
            status: CartStatus.INACTIVE,
          });
        } else {
          return guestCart;
        }
      }
    }

    throw new NotFoundException('Cart not found');
  }

  async updateItemQuantity(
    cartId: string,
    itemId: string,
    type: 'increase' | 'decrease',
  ) {
    return this.dataSource.transaction(async (tx) => {
      const cartItemRepository = tx.getRepository(CartItem);

      const item = await cartItemRepository.findOne({
        where: {
          id: itemId,
          cart: { id: cartId },
          isActive: true,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        throw new NotFoundException('Cart item not found');
      }

      const [cart, variant] = await Promise.all([
        tx.getRepository(Cart).findOneBy({
          id: cartId,
          status: CartStatus.ACTIVE,
        }),
        tx.getRepository(ProductVariant).findOneBy({
          id: item.variantId,
          isActive: true,
        }),
      ]);

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      if (dayjs().isAfter(dayjs(cart.expiresAt))) {
        throw new BadRequestException('Cart has expired');
      }

      if (type === 'increase') {
        if (
          variant.stockStatus === 'out_of_stock' ||
          item.quantity + 1 > variant.stockQuantity
        ) {
          throw new BadRequestException('Not enough stock for this product');
        }
        item.quantity += 1;
      } else {
        item.quantity = Math.max(item.quantity - 1, 0);
        if (item.quantity === 0) item.isActive = false;
      }

      return cartItemRepository.save(item);
    });
  }

  async removeCartItem(cartId: string, itemId: string) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId, isActive: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.isActive = false;

    return this.cartItemRepository.save(cartItem);
  }

  private async findOne(id: string) {
    const [result] = await this.dataSource.query<
      {
        id: string;
        user_id: string;
        session_id: string;
        expires_at: string;
        items: {
          id: string;
          quantity: number;
          variantId: string;
          variantName: string;
          price: number;
          salePrice: number | null;
          stockStatus: ProductVariantStockStatus;
          imageUrl: string | null;
        }[];
      }[]
    >(
      `
        SELECT
          c.id,
          c.user_id,
          c.session_id,
          c.expires_at,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', ci.id,
                'quantity', ci.quantity,
                'variantId', ci.variant_id,
                'variantName', v.name,
                'price', v.price,
                'salePrice', v.sale_price,
                'stockStatus', v.stock_status,
                'imageUrl', img.url
              )
              ORDER BY COALESCE(ci.updated_at, ci.created_at) DESC
            ) FILTER (WHERE ci.id IS NOT NULL),
            '[]'
          ) AS items
        FROM carts c
        LEFT JOIN cart_items ci ON ci.cart_id = c.id AND ci.is_active = true
        LEFT JOIN product_variants v ON v.id = ci.variant_id AND v.is_active = true
        LEFT JOIN products p ON p.id = v.product_id AND p.is_active = true
        LEFT JOIN LATERAL (
          SELECT ma.url
          FROM product_images pi
          LEFT JOIN media_assets ma 
            ON ma.ref_type = $1 
            AND ma.ref_id::uuid = pi.id 
            AND ma.is_active = true 
            AND ma.usage_type = $2
          WHERE pi.product_id = p.id AND pi.is_active = true
          ORDER BY COALESCE(pi.updated_at, pi.created_at) DESC
          LIMIT 1
        ) img ON true
        WHERE c.id = $3 AND c.status = $4
        GROUP BY c.id
      `,
      [
        MediaAssetRefType.PRODUCT,
        MediaAssetUsageType.MAIN,
        id,
        CartStatus.ACTIVE,
      ],
    );

    if (!result) {
      throw new NotFoundException('Cart not found');
    }

    return {
      id: result.id,
      userId: result.user_id,
      sessionId: result.session_id,
      expiresAt: result.expires_at,
      items: result.items,
    };
  }

  private async findCartItemById(itemId: string) {
    const [result] = await this.dataSource.query<
      {
        id: string;
        quantity: number;
        variantId: string;
        variantName: string;
        price: number;
        salePrice: number | null;
        stockStatus: ProductVariantStockStatus;
        imageUrl: string | null;
      }[]
    >(
      `
      SELECT
        ci.id,
        ci.quantity,
        ci.variant_id AS "variantId",
        v.name AS "variantName",
        v.price,
        v.sale_price AS "salePrice",
        v.stock_status AS "stockStatus",
        ma.url AS "imageUrl"
      FROM cart_items ci
      LEFT JOIN product_variants v ON v.id = ci.variant_id AND v.is_active = true
      LEFT JOIN products p ON p.id = v.product_id AND p.is_active = true
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_active = true
      LEFT JOIN media_assets ma 
        ON ma.ref_type = $1 
        AND ma.ref_id::uuid = pi.id 
        AND ma.is_active = true
        AND ma.usage_type = $2
      WHERE ci.id = $3 AND ci.is_active = true
      LIMIT 1
    `,
      [MediaAssetRefType.PRODUCT, MediaAssetUsageType.MAIN, itemId],
    );

    if (!result) return null;

    return {
      id: result.id,
      quantity: result.quantity,
      variantId: result.variantId,
      variantName: result.variantName,
      price: result.price,
      salePrice: result.salePrice,
      stockStatus: result.stockStatus,
      imageUrl: result.imageUrl,
    };
  }

  private getNewExpiryDate(): Date {
    return dayjs().utc().add(7, 'day').toDate();
  }
}
