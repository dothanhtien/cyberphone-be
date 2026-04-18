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
}
