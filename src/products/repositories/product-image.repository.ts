import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  ProductImageCreateEntityDto,
  ProductImageUpdateEntityDto,
} from '../admin/dto';
import { ProductImage } from '@/products/entities';

export interface IProductImageRepository {
  findActiveByProductId(productId: string): Promise<ProductImage[]>;
  create(
    tx: EntityManager,
    data: ProductImageCreateEntityDto[],
  ): Promise<ProductImage[]>;
  bulkInsert(
    tx: EntityManager,
    data: ProductImageCreateEntityDto[],
  ): Promise<ProductImage[]>;
  bulkUpdate(
    tx: EntityManager,
    updates: { id: string; data: ProductImageUpdateEntityDto }[],
  ): Promise<void>;
  bulkDelete(tx: EntityManager, ids: string[]): Promise<void>;
}

export const PRODUCT_IMAGE_REPOSITORY = Symbol('IProductImageRepository');

@Injectable()
export class ProductImageRepository implements IProductImageRepository {
  constructor(
    @InjectRepository(ProductImage)
    private readonly repository: Repository<ProductImage>,
  ) {}

  findActiveByProductId(productId: string): Promise<ProductImage[]> {
    return this.repository.find({ where: { productId, isActive: true } });
  }

  async create(
    tx: EntityManager,
    data: ProductImageCreateEntityDto[],
  ): Promise<ProductImage[]> {
    if (!data.length) return [];

    return tx.save(ProductImage, data);
  }

  async bulkInsert(
    tx: EntityManager,
    data: ProductImageCreateEntityDto[],
  ): Promise<ProductImage[]> {
    if (!data.length) return [];

    const result = await tx
      .createQueryBuilder()
      .insert()
      .into(ProductImage)
      .values(data)
      .returning('*')
      .execute();

    return result.generatedMaps as ProductImage[];
  }

  async bulkUpdate(
    tx: EntityManager,
    updates: { id: string; data: ProductImageUpdateEntityDto }[],
  ): Promise<void> {
    if (!updates.length) return;
    await Promise.all(
      updates.map((u) => tx.update(ProductImage, u.id, u.data)),
    );
  }

  async bulkDelete(tx: EntityManager, ids: string[]): Promise<void> {
    if (!ids.length) return;

    await tx
      .createQueryBuilder()
      .delete()
      .from(ProductImage)
      .whereInIds(ids)
      .execute();
  }
}
