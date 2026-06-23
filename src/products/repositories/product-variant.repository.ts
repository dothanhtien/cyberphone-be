import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  ProductVariantCreateEntityDto,
  ProductVariantUpdateEntityDto,
} from '../admin/dto';
import { ProductVariantListRaw, ProductVariantRaw } from '../admin/types';
import { ProductVariant } from '../entities';
import { MediaAssetRefType } from '@/common/enums';
import { isUniqueConstraintError } from '@/common/utils';

export interface IProductVariantRepository {
  existsActiveByProductId(
    productId: string,
    tx: EntityManager,
  ): Promise<boolean>;
  save(
    data: ProductVariantCreateEntityDto,
    tx: EntityManager,
  ): Promise<ProductVariant>;
  findAllByProductId(productId: string): Promise<ProductVariant[]>;
  findAllRawByProductId(productId: string): Promise<ProductVariantListRaw[]>;
  findOneActiveById(
    id: string,
    tx?: EntityManager,
  ): Promise<ProductVariant | null>;
  findOneRawById(id: string): Promise<ProductVariantRaw | null>;
  update(
    existing: ProductVariant,
    data: ProductVariantUpdateEntityDto,
    tx: EntityManager,
  ): Promise<ProductVariant>;
  unsetDefaultVariant(productId: string, tx: EntityManager): Promise<void>;
  decrementStock(
    variantId: string,
    quantity: number,
    tx: EntityManager,
  ): Promise<boolean>;
  restoreStock(
    variantId: string,
    quantity: number,
    tx: EntityManager,
  ): Promise<void>;
  softDelete(id: string, tx: EntityManager): Promise<void>;
  countActiveByProductId(productId: string, tx: EntityManager): Promise<number>;
}

export const PRODUCT_VARIANT_REPOSITORY = Symbol('IProductVariantRepository');

@Injectable()
export class ProductVariantRepository implements IProductVariantRepository {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly repository: Repository<ProductVariant>,
  ) {}

  existsActiveByProductId(
    productId: string,
    tx: EntityManager,
  ): Promise<boolean> {
    return tx
      .getRepository(ProductVariant)
      .exists({ where: { productId, isActive: true } });
  }

  async save(
    data: ProductVariantCreateEntityDto,
    tx: EntityManager,
  ): Promise<ProductVariant> {
    try {
      return await tx.getRepository(ProductVariant).save(data);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('SKU already exists');
      }
      throw error;
    }
  }

  findAllByProductId(productId: string): Promise<ProductVariant[]> {
    return this.repository.find({
      where: { productId, isActive: true },
      order: {
        isDefault: 'DESC',
        updatedAt: { direction: 'DESC', nulls: 'LAST' },
        createdAt: 'DESC',
      },
      relations: { attributes: true },
    });
  }

  findOneActiveById(
    id: string,
    tx?: EntityManager,
  ): Promise<ProductVariant | null> {
    const repo = tx ? tx.getRepository(ProductVariant) : this.repository;
    return repo.findOne({ where: { id, isActive: true } });
  }

  async findAllRawByProductId(
    productId: string,
  ): Promise<ProductVariantListRaw[]> {
    return this.repository.query<ProductVariantListRaw[]>(
      `
        SELECT
          pv.id,
          pv.product_id AS "productId",
          pv.sku,
          pv.name,
          pv.price,
          pv.sale_price AS "salePrice",
          pv.cost_price AS "costPrice",
          pv.stock_quantity AS "stockQuantity",
          pv.stock_status AS "stockStatus",
          pv.low_stock_threshold AS "lowStockThreshold",
          pv.is_default AS "isDefault",
          pv.is_active AS "isActive",
          pv.created_at AS "createdAt",
          pv.created_by AS "createdBy",
          pv.updated_at AS "updatedAt",
          pv.updated_by AS "updatedBy",
          (
            SELECT m2.url
            FROM product_images pi2
            LEFT JOIN media_assets m2 ON m2.ref_type = $1 AND m2.ref_id::uuid = pi2.id AND m2.is_active = true
            WHERE pi2.variant_id = pv.id AND pi2.is_active = true AND pi2.image_type = 'main'
            LIMIT 1
          ) AS "mainImageUrl"
        FROM product_variants pv
        WHERE pv.product_id = $2 AND pv.is_active = true
        ORDER BY pv.is_default DESC, COALESCE(pv.updated_at, pv.created_at) DESC
      `,
      [MediaAssetRefType.PRODUCT, productId],
    );
  }

  async findOneRawById(id: string): Promise<ProductVariantRaw | null> {
    const rows = await this.repository.query<ProductVariantRaw[]>(
      `
        SELECT
          pv.id,
          pv.product_id AS "productId",
          pv.sku,
          pv.name,
          pv.price,
          pv.sale_price AS "salePrice",
          pv.cost_price AS "costPrice",
          pv.stock_quantity AS "stockQuantity",
          pv.stock_status AS "stockStatus",
          pv.low_stock_threshold AS "lowStockThreshold",
          pv.is_default AS "isDefault",
          pv.is_active AS "isActive",
          pv.created_at AS "createdAt",
          pv.created_by AS "createdBy",
          pv.updated_at AS "updatedAt",
          pv.updated_by AS "updatedBy",
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', va.id,
                'productAttributeId', va.product_attribute_id,
                'attributeValue', va.attribute_value,
                'attributeValueDisplay', va.attribute_value_display
              )
            ) FILTER (WHERE va.id IS NOT NULL), '[]'
          ) AS attributes,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pi.id,
                'imageType', pi.image_type,
                'displayOrder', pi.display_order,
                'altText', pi.alt_text,
                'url', m.url
              )
            ) FILTER (WHERE pi.id IS NOT NULL), '[]'
          ) AS images
        FROM product_variants pv
        LEFT JOIN variant_attributes va ON va.variant_id = pv.id AND va.is_active = true
        LEFT JOIN product_images pi ON pi.variant_id = pv.id AND pi.is_active = true
        LEFT JOIN media_assets m ON m.ref_type = $1 AND m.ref_id::uuid = pi.id AND m.is_active = true
        WHERE pv.id = $2 AND pv.is_active = true
        GROUP BY pv.id
      `,
      [MediaAssetRefType.PRODUCT, id],
    );

    return rows[0] ?? null;
  }

  async update(
    existing: ProductVariant,
    data: ProductVariantUpdateEntityDto,
    tx: EntityManager,
  ): Promise<ProductVariant> {
    const repo = tx.getRepository(ProductVariant);
    const merged = repo.merge(existing, data);

    try {
      return await repo.save(merged);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('SKU already exists');
      }
      throw error;
    }
  }

  async unsetDefaultVariant(
    productId: string,
    tx: EntityManager,
  ): Promise<void> {
    await tx.update(
      ProductVariant,
      { productId, isDefault: true, isActive: true },
      { isDefault: false },
    );
  }

  async decrementStock(
    variantId: string,
    quantity: number,
    tx: EntityManager,
  ): Promise<boolean> {
    if (quantity <= 0) return false;
    const result = await tx.query<{ id: string }[]>(
      `
        UPDATE product_variants
        SET
          stock_quantity = stock_quantity - $1,
          stock_status = CASE
            WHEN stock_quantity - $1 <= 0 THEN 'out_of_stock'
            WHEN stock_quantity - $1 <= low_stock_threshold THEN 'low_stock'
            ELSE 'in_stock'
          END
        WHERE id = $2
          AND is_active = true
          AND stock_quantity >= $1
        RETURNING id
      `,
      [quantity, variantId],
    );

    return result.length > 0;
  }

  async softDelete(id: string, tx: EntityManager): Promise<void> {
    await tx.update(ProductVariant, { id }, { isActive: false });
  }

  async countActiveByProductId(
    productId: string,
    tx: EntityManager,
  ): Promise<number> {
    return tx
      .getRepository(ProductVariant)
      .count({ where: { productId, isActive: true } });
  }

  async restoreStock(
    variantId: string,
    quantity: number,
    tx: EntityManager,
  ): Promise<void> {
    if (quantity <= 0) {
      throw new Error(
        `restoreStock requires a positive quantity, got ${quantity} for variant ${variantId}`,
      );
    }
    await tx.query(
      `
        UPDATE product_variants
        SET
          stock_quantity = stock_quantity + $1,
          stock_status = CASE
            WHEN stock_quantity + $1 <= 0 THEN 'out_of_stock'
            WHEN stock_quantity + $1 <= low_stock_threshold THEN 'low_stock'
            ELSE 'in_stock'
          END
        WHERE id = $2
      `,
      [quantity, variantId],
    );
  }
}
