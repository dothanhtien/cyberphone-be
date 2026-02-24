import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { sanitizeEntityInput } from '@/common/utils/entities';
import { CreateProductVariantDto } from './dto/requests/create-product-variant.dto';
import { ProductVariantCreateEntityDto } from './dto/entity-inputs/product-variant-create-entity.dto';
import { Product } from '@/products/entities/product.entity';
import { ProductVariantStockStatus } from '@/common/enums';
import { isUniqueConstraintError } from '@/common/utils/database-error.util';
import { UpdateProductVariantDto } from './dto/requests/update-product-variant.dto';
import { ProductVariantUpdateEntityDto } from './dto/entity-inputs/product-variant-update-entity.dto';

@Injectable()
export class ProductVariantsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  async create(
    productId: string,
    createProductVariantDto: CreateProductVariantDto,
  ) {
    await this.ensureProductExists(productId);

    return this.dataSource.transaction(async (tx) => {
      const variantRepo = tx.getRepository(ProductVariant);

      const hasActiveVariants = await variantRepo.exists({
        where: {
          productId,
          isActive: true,
        },
      });

      const stockStatus = this.calculateStockStatus(
        createProductVariantDto.stockQuantity,
        createProductVariantDto.lowStockThreshold,
      );

      const entityInput = sanitizeEntityInput(ProductVariantCreateEntityDto, {
        ...createProductVariantDto,
        productId,
        stockStatus,
      });

      let isDefault = createProductVariantDto.isDefault ?? false;

      if (!hasActiveVariants) {
        isDefault = true;
      }

      if (isDefault) {
        await this.unsetDefaultVariant(tx, productId);
      }

      const variant = variantRepo.create({
        ...entityInput,
        isDefault,
      });

      try {
        return await variantRepo.save(variant);
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ConflictException('SKU already exists');
        }
        throw error;
      }
    });
  }

  async findAllByProductId(productId: string): Promise<ProductVariant[]> {
    await this.ensureProductExists(productId);

    return this.productVariantRepository.find({
      where: {
        productId,
        isActive: true,
      },
      order: {
        isDefault: 'DESC',
        updatedAt: { direction: 'DESC', nulls: 'LAST' },
        createdAt: 'DESC',
      },
    });
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    return this.dataSource.transaction(async (tx) => {
      const variantRepo = tx.getRepository(ProductVariant);

      const existing = await variantRepo.findOne({
        where: { id, isActive: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!existing) {
        throw new NotFoundException('Variant not found');
      }

      let isDefault = existing.isDefault;

      if (updateProductVariantDto.isDefault === true) {
        await this.unsetDefaultVariant(tx, existing.productId);
        isDefault = true;
      }

      if (updateProductVariantDto.isDefault === false && existing.isDefault) {
        const activeCount = await variantRepo.count({
          where: {
            productId: existing.productId,
            isActive: true,
          },
        });

        if (activeCount >= 1) {
          throw new ConflictException(
            'Cannot unset default variant without assigning another one',
          );
        }
      }

      let stockStatus: ProductVariantStockStatus | undefined;

      if (
        updateProductVariantDto.stockQuantity !== undefined ||
        updateProductVariantDto.lowStockThreshold !== undefined
      ) {
        stockStatus = this.calculateStockStatus(
          updateProductVariantDto.stockQuantity ?? existing.stockQuantity,
          updateProductVariantDto.lowStockThreshold ??
            existing.lowStockThreshold,
        );
      }

      const updatePayload = sanitizeEntityInput(ProductVariantUpdateEntityDto, {
        ...updateProductVariantDto,
        ...(stockStatus && { stockStatus }),
        isDefault,
      });

      try {
        await variantRepo.update(id, updatePayload);

        return variantRepo.findOne({ where: { id } });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ConflictException('SKU already exists');
        }
        throw error;
      }
    });
  }

  private async ensureProductExists(productId: string) {
    const exists = await this.productRepository.exists({
      where: { id: productId, isActive: true },
    });

    if (!exists) {
      throw new NotFoundException('Product not found');
    }
  }

  private async unsetDefaultVariant(tx: EntityManager, productId: string) {
    await tx.update(
      ProductVariant,
      {
        productId,
        isDefault: true,
        isActive: true,
      },
      { isDefault: false },
    );
  }

  private calculateStockStatus(
    stockQuantity?: number,
    lowStockThreshold?: number,
  ) {
    const quantity = stockQuantity ?? 0;
    const threshold = lowStockThreshold ?? 5;

    if (quantity <= 0) {
      return ProductVariantStockStatus.OUT_OF_STOCK;
    }

    if (quantity <= threshold) {
      return ProductVariantStockStatus.LOW_STOCK;
    }

    return ProductVariantStockStatus.IN_STOCK;
  }
}
