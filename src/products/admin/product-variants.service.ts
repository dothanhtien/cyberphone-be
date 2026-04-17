import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ProductVariant } from '../entities';
import {
  CreateProductVariantDto,
  ProductVariantCreateEntityDto,
  ProductVariantUpdateEntityDto,
  UpdateProductVariantDto,
} from './dto';
import { Product } from '@/products/entities';
import { ProductVariantStockStatus } from '@/common/enums';
import { isUniqueConstraintError, sanitizeEntityInput } from '@/common/utils';
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

      await this.variantAttributesService.sync({
        productId,
        variantId: savedVariant.id,
        attributes: createProductVariantDto.attributes,
        actor: createProductVariantDto.createdBy,
        tx,
      });

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

  async findOneActiveById(id: string, tx?: EntityManager) {
    const repository = tx
      ? tx.getRepository(ProductVariant)
      : this.productVariantRepository;

    return repository.findOne({ where: { id, isActive: true } });
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

      if (
        updateProductVariantDto.price !== undefined ||
        updateProductVariantDto.salePrice !== undefined
      ) {
        const nextPrice =
          updateProductVariantDto.price ?? Number(existing.price);
        const nextSalePrice =
          updateProductVariantDto.salePrice === undefined
            ? existing.salePrice === null
              ? null
              : Number(existing.salePrice)
            : updateProductVariantDto.salePrice;

        this.validatePrices(nextPrice, nextSalePrice);
      }

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

      await this.variantAttributesService.sync({
        productId: existing.productId,
        variantId: id,
        attributes: updateProductVariantDto.attributes,
        actor: updateProductVariantDto.updatedBy,
        tx,
      });

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
    if (salePrice && salePrice !== null && salePrice > price) {
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
