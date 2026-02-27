import {
  BadRequestException,
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
import { VariantAttributesService } from './variant-attributes.service';

@Injectable()
export class ProductVariantsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    private readonly variantAttributesService: VariantAttributesService,
  ) {}

  async create(
    productId: string,
    createProductVariantDto: CreateProductVariantDto,
  ) {
    this.validatePrices(
      createProductVariantDto.price,
      createProductVariantDto.salePrice,
    );

    await this.ensureProductExists(productId);

    return this.dataSource.transaction(async (tx) => {
      const variantRepository = tx.getRepository(ProductVariant);

      const hasActiveVariants = await variantRepository.exists({
        where: {
          productId,
          isActive: true,
        },
      });

      let isDefault = createProductVariantDto.isDefault ?? false;

      if (!hasActiveVariants) {
        isDefault = true;
      }

      if (isDefault) {
        await this.unsetDefaultVariant(tx, productId);
      }

      const stockStatus = this.calculateStockStatus(
        createProductVariantDto.stockQuantity,
        createProductVariantDto.lowStockThreshold,
      );

      const entityInput = sanitizeEntityInput(ProductVariantCreateEntityDto, {
        ...createProductVariantDto,
        productId,
        stockStatus,
      });

      const variant = variantRepository.create({
        ...entityInput,
        isDefault,
      });

      let savedVariant: ProductVariant;

      try {
        savedVariant = await variantRepository.save(variant);
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ConflictException('SKU already exists');
        }
        throw error;
      }

      await this.variantAttributesService.createAttributes(
        tx,
        productId,
        savedVariant.id,
        createProductVariantDto.attributes,
        createProductVariantDto.createdBy,
      );

      return savedVariant;
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
      relations: {
        attributes: true,
      },
    });
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    return this.dataSource.transaction(async (tx) => {
      const variantRepository = tx.getRepository(ProductVariant);

      const existing = await variantRepository.findOne({
        where: { id, isActive: true },
      });

      if (!existing) {
        throw new NotFoundException('Variant not found');
      }

      this.validatePrices(
        updateProductVariantDto.price ?? Number(existing.price),
        updateProductVariantDto.salePrice,
      );

      let isDefault = existing.isDefault;

      if (updateProductVariantDto.isDefault === true && !existing.isDefault) {
        await this.unsetDefaultVariant(tx, existing.productId);
        isDefault = true;
      }

      if (updateProductVariantDto.isDefault === false && existing.isDefault) {
        throw new ConflictException(
          'Cannot unset default variant without assigning another one. Please set another variant as default first',
        );
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

      const merged = variantRepository.merge(existing, updatePayload);

      let savedVariant: ProductVariant;

      try {
        savedVariant = await variantRepository.save(merged);
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ConflictException('SKU already exists');
        }
        throw error;
      }

      if (updateProductVariantDto.attributes?.length) {
        await this.variantAttributesService.updateAttributes(
          tx,
          id,
          existing.productId,
          updateProductVariantDto.attributes,
          updateProductVariantDto.updatedBy,
        );
      }

      return savedVariant;
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

  private validatePrices(price: number, salePrice?: number | null) {
    if (salePrice && salePrice > price) {
      throw new BadRequestException('Sale price cannot be greater than price');
    }
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
