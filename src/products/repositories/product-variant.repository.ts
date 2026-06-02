import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ProductVariant } from '../entities';
import {
  ProductVariantCreateEntityDto,
  ProductVariantUpdateEntityDto,
} from '../admin/dto';
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
  findOneActiveById(
    id: string,
    tx?: EntityManager,
  ): Promise<ProductVariant | null>;
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

  async restoreStock(
    variantId: string,
    quantity: number,
    tx: EntityManager,
  ): Promise<void> {
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
        WHERE id = $2 AND is_active = true
      `,
      [quantity, variantId],
    );
  }
}
