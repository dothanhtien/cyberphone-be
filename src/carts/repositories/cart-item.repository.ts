import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  CartItemCreateEntityInput,
  CartItemUpdateEntityInput,
} from '../storefront/dto';
import { CartItem } from '../entities';
import { CartItemRaw } from '../storefront/types';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';

interface FindOneActiveByCartIdAndVariantIdParams {
  cartId: string;
  variantId: string;
  tx: EntityManager;
}

export interface ICartItemRepository {
  create(data: CartItemCreateEntityInput): Promise<CartItem>;
  findOneActiveByCartIdAndVariantId(
    params: FindOneActiveByCartIdAndVariantIdParams,
  ): Promise<CartItem | null>;
  findOneActiveById(id: string): Promise<CartItem | null>;
  findStorefrontCartItemById(id: string): Promise<CartItemRaw | null>;
  update(id: string, data: CartItemUpdateEntityInput): Promise<boolean>;
}

export const CART_ITEM_REPOSITORY = Symbol('ICartItemRepository');

export class CartItemRepository implements ICartItemRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  create(data: CartItemCreateEntityInput): Promise<CartItem> {
    return this.cartItemRepository.save(data);
  }

  findOneActiveByCartIdAndVariantId({
    cartId,
    variantId,
    tx,
  }: FindOneActiveByCartIdAndVariantIdParams): Promise<CartItem | null> {
    return tx.getRepository(CartItem).findOne({
      where: {
        cartId,
        variantId,
        isActive: true,
      },
    });
  }

  findOneActiveById(id: string): Promise<CartItem | null> {
    return this.cartItemRepository.findOne({ where: { id, isActive: true } });
  }

  async findStorefrontCartItemById(id: string): Promise<CartItemRaw | null> {
    const [result] = await this.dataSource.query<CartItemRaw[]>(
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
        INNER JOIN product_variants v ON v.id = ci.variant_id AND v.is_active = true
        INNER JOIN products p ON p.id = v.product_id AND p.is_active = true
        LEFT JOIN LATERAL (
          SELECT ma.url
          FROM product_images pi
          JOIN media_assets ma 
            ON ma.ref_id::uuid = pi.id
            AND ma.ref_type = $1
            AND ma.usage_type = $2
            AND ma.is_active = true
          WHERE pi.product_id = p.id AND pi.is_active = true
          ORDER BY pi.created_at ASC
          LIMIT 1
        ) ma ON true
        WHERE ci.id = $3 AND ci.is_active = true
        LIMIT 1
      `,
      [MediaAssetRefType.PRODUCT, MediaAssetUsageType.MAIN, id],
    );

    return result ?? null;
  }

  async update(id: string, data: CartItemUpdateEntityInput): Promise<boolean> {
    const result = await this.cartItemRepository.update(id, data);
    return (result.affected ?? 0) > 0;
  }
}
