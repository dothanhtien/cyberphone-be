import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CartUpdateEntityDto as AdminCartUpdateEntityDto } from '../admin/dto';
import { Cart } from '../entities';
import { CartStatus } from '../enums';
import { CartCreateEntityInput, CartUpdateEntityDto } from '../storefront/dto';
import { FindOneCartRaw } from '../storefront/types';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';

interface FindOneActiveByCustomerIdOrSessionIdParams {
  customerId?: string;
  sessionId?: string;
}

export interface ICartRepository {
  create(data: CartCreateEntityInput): Promise<Cart>;
  findOne(id: string, tx: EntityManager): Promise<Cart | null>;
  findOneActiveByCustomerIdOrSessionId(
    params: FindOneActiveByCustomerIdOrSessionIdParams,
  ): Promise<Cart | null>;
  findOneActiveById(id: string, tx?: EntityManager): Promise<Cart | null>;
  findStorefrontCartById(id: string): Promise<FindOneCartRaw | null>;
  update(
    id: string,
    data: CartUpdateEntityDto,
    tx?: EntityManager,
  ): Promise<void>;
  adminUpdate(
    id: string,
    data: AdminCartUpdateEntityDto,
    tx?: EntityManager,
  ): Promise<void>;
}

export const CART_REPOSITORY = Symbol('ICartRepository');

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
  ) {}

  create(data: CartCreateEntityInput): Promise<Cart> {
    return this.cartRepository.save(data);
  }

  findOne(id: string, tx: EntityManager): Promise<Cart | null> {
    return tx.getRepository(Cart).findOne({ where: { id } });
  }

  findOneActiveByCustomerIdOrSessionId({
    customerId,
    sessionId,
  }: FindOneActiveByCustomerIdOrSessionIdParams): Promise<Cart | null> {
    const conditions: FindOptionsWhere<Cart>[] = [];
    if (customerId) conditions.push({ customerId, status: CartStatus.ACTIVE });
    if (sessionId) conditions.push({ sessionId, status: CartStatus.ACTIVE });
    if (!conditions.length) return Promise.resolve(null);

    return this.cartRepository.findOne({ where: conditions });
  }

  findOneActiveById(id: string, tx?: EntityManager): Promise<Cart | null> {
    const repository = tx ? tx.getRepository(Cart) : this.cartRepository;

    return repository.findOne({
      where: { id, status: CartStatus.ACTIVE },
    });
  }

  async findStorefrontCartById(id: string): Promise<FindOneCartRaw | null> {
    const [result] = await this.dataSource.query<FindOneCartRaw[]>(
      `
        SELECT
          c.id,
          c.customer_id AS "customerId",
          c.session_id AS "sessionId",
          c.expires_at AS "expiresAt",
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

    return result ?? null;
  }

  async update(
    id: string,
    data: CartUpdateEntityDto,
    tx?: EntityManager,
  ): Promise<void> {
    const repository = tx ? tx.getRepository(Cart) : this.cartRepository;
    await repository.update(id, data);
  }

  async adminUpdate(
    id: string,
    data: AdminCartUpdateEntityDto,
    tx?: EntityManager,
  ): Promise<void> {
    const repository = tx ? tx.getRepository(Cart) : this.cartRepository;
    await repository.update(id, data);
  }
}
