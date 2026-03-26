import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ProductAttribute } from '@/products/entities';
import {
  ProductAttributeCreateEntityDto,
  ProductAttributeUpdateEntityDto,
} from '../dto';

export interface IProductAttributeRepository {
  findActiveByProductId(
    productId: string,
    tx?: EntityManager,
  ): Promise<ProductAttribute[]>;
  findUsedAttributes(
    ids: string[],
    tx: EntityManager,
  ): Promise<{ id: string }[]>;
  create(
    data: ProductAttributeCreateEntityDto[],
    tx: EntityManager,
  ): Promise<void>;
  update(
    id: string,
    data: ProductAttributeUpdateEntityDto,
    tx: EntityManager,
  ): Promise<void>;
  bulkUpdate(
    ids: string[],
    data: ProductAttributeUpdateEntityDto,
    tx: EntityManager,
  ): Promise<void>;
  delete(ids: string[], tx: EntityManager): Promise<void>;
}

export const PRODUCT_ATTRIBUTE_REPOSITORY = Symbol(
  'IProductAttributeRepository',
);

@Injectable()
export class ProductAttributeRepository implements IProductAttributeRepository {
  constructor(
    @InjectRepository(ProductAttribute)
    private readonly productAttributeRepository: Repository<ProductAttribute>,
  ) {}

  findActiveByProductId(
    productId: string,
    tx?: EntityManager,
  ): Promise<ProductAttribute[]> {
    const repository = tx
      ? tx.getRepository(ProductAttribute)
      : this.productAttributeRepository;

    return repository.find({
      where: { productId, isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findUsedAttributes(
    ids: string[],
    tx: EntityManager,
  ): Promise<{ id: string }[]> {
    return tx
      .createQueryBuilder()
      .select('va.productAttributeId', 'id')
      .from('variant_attributes', 'va')
      .where('va.productAttributeId IN (:...ids)', { ids })
      .groupBy('va.productAttributeId')
      .getRawMany<{ id: string }>();
  }

  async create(
    data: ProductAttributeCreateEntityDto[],
    tx: EntityManager,
  ): Promise<void> {
    await tx.insert(ProductAttribute, data);
  }

  async update(
    id: string,
    data: ProductAttributeUpdateEntityDto,
    tx: EntityManager,
  ): Promise<void> {
    await tx.update(ProductAttribute, id, data);
  }

  async bulkUpdate(
    ids: string[],
    data: ProductAttributeUpdateEntityDto,
    tx: EntityManager,
  ) {
    if (!ids.length) return;

    await tx.update(ProductAttribute, { id: In(ids) }, data);
  }

  async delete(ids: string[], tx: EntityManager): Promise<void> {
    await tx.delete(ProductAttribute, { id: In(ids) });
  }
}
