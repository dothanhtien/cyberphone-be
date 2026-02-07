import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { sanitizeEntityInput } from '@/common/utils/entities';
import { CreateProductVariantDto } from './dto/requests/create-product-variant.dto';
import { ProductVariantCreateEntityDto } from './dto/entity-inputs/product-variant-create-entity.dto';
import { Product } from '@/products/entities/product.entity';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { PaginatedEntity } from '@/common/types/paginations.type';
import {
  buildPaginationParams,
  extractPaginationParams,
} from '@/common/utils/paginations.util';
import { UpdateProductVariantDto } from './dto/requests/update-product-variant.dto';
import { ProductVariantUpdateEntityDto } from './dto/entity-inputs/product-variant-update-entity.dto';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    const productExists = await this.productRepository.exists({
      where: {
        id: createProductVariantDto.productId,
        isActive: true,
      },
    });

    if (!productExists) {
      throw new NotFoundException('Product not found');
    }

    const skuExists = await this.productVariantRepository.findOne({
      where: {
        sku: createProductVariantDto.sku,
        isActive: true,
      },
    });

    if (skuExists) {
      throw new ConflictException('Variant already exists');
    }

    const entityInput = sanitizeEntityInput(
      ProductVariantCreateEntityDto,
      createProductVariantDto,
    );

    const variant = this.productVariantRepository.create(entityInput);
    return this.productVariantRepository.save(variant);
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<ProductVariant>> {
    const { page, limit } = extractPaginationParams(paginationQueryDto);

    const [variants, totalCount] =
      await this.productVariantRepository.findAndCount({
        where: { isActive: true },
        ...buildPaginationParams(page, limit),
        order: { updatedAt: 'DESC' },
      });

    return {
      items: variants,
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    const variant = await this.productVariantRepository.findOne({
      where: { id, isActive: true },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return variant;
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    const variant = await this.productVariantRepository.findOne({
      where: { id, isActive: true },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    if (
      updateProductVariantDto.sku &&
      updateProductVariantDto.sku !== variant.sku
    ) {
      const skuExists = await this.productVariantRepository.exists({
        where: {
          sku: updateProductVariantDto.sku,
          isActive: true,
        },
      });

      if (skuExists) {
        throw new ConflictException('SKU already exists');
      }
    }

    if (updateProductVariantDto.isDefault === true && !variant.isDefault) {
      await this.productVariantRepository.update(
        {
          productId: variant.productId,
          isDefault: true,
        },
        { isDefault: false },
      );
    }

    const entityInput = sanitizeEntityInput(
      ProductVariantUpdateEntityDto,
      updateProductVariantDto,
    );

    const updatedVariant = this.productVariantRepository.merge(
      variant,
      entityInput,
    );

    return this.productVariantRepository.save(updatedVariant);
  }
}
