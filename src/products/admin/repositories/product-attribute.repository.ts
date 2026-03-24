import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductAttribute } from '@/products/entities';

export interface IProductAttributeRepository {
  findActiveByProductId(productId: string): Promise<ProductAttribute[]>;
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

  findActiveByProductId(productId: string): Promise<ProductAttribute[]> {
    return this.productAttributeRepository.find({
      where: { productId, isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }
}
