import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AdminProductValidatorsService } from './admin-product-validators.service';
import { AdminVariantAttributesService } from './admin-variant-attributes.service';
import {
  CreateProductVariantDto,
  ProductVariantCreateEntityDto,
  ProductVariantUpdateEntityDto,
  UpdateProductVariantDto,
} from './dto';
import { ProductVariant } from '../entities';
import {
  type IProductVariantRepository,
  PRODUCT_VARIANT_REPOSITORY,
} from '../repositories';
import { ProductVariantStockStatus } from '@/common/enums';
import { sanitizeEntityInput } from '@/common/utils';

@Injectable()
export class AdminProductVariantsService {
  private readonly logger = new Logger(AdminProductVariantsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly productVariantRepository: IProductVariantRepository,
    private readonly variantAttributesService: AdminVariantAttributesService,
    private readonly productValidatorsService: AdminProductValidatorsService,
  ) {}

  async create(
    productId: string,
    createProductVariantDto: CreateProductVariantDto,
  ) {
    const { sku } = createProductVariantDto;

    this.logger.debug(
      `[create] Creating variant productId=${productId}, sku=${sku}`,
    );

    this.validatePrices(
      createProductVariantDto.price,
      createProductVariantDto.salePrice,
    );

    await this.productValidatorsService.ensureProductExists(productId);

    return this.dataSource.transaction(async (tx) => {
      const hasActiveVariants =
        await this.productVariantRepository.existsActiveByProductId(
          productId,
          tx,
        );

      let isDefault = createProductVariantDto.isDefault;

      if (!hasActiveVariants) {
        this.logger.debug(
          `[create] No active variants - force default productId=${productId}, sku=${sku}`,
        );
        isDefault = true;
      }

      if (isDefault) {
        this.logger.debug(
          `[create] Unsetting previous default variants productId=${productId}, sku=${sku}`,
        );
        await this.productVariantRepository.unsetDefaultVariant(productId, tx);
      }

      const stockStatus = this.calculateStockStatus(
        createProductVariantDto.stockQuantity,
        createProductVariantDto.lowStockThreshold,
      );

      const entityInput = sanitizeEntityInput(ProductVariantCreateEntityDto, {
        ...createProductVariantDto,
        productId,
        stockStatus,
        isDefault,
      });

      const savedVariant = await this.productVariantRepository.save(
        entityInput,
        tx,
      );

      await this.variantAttributesService.sync({
        productId,
        variantId: savedVariant.id,
        attributes: createProductVariantDto.attributes,
        actor: createProductVariantDto.createdBy,
        tx,
      });

      this.logger.debug(
        `[create] Created variant successful id=${savedVariant.id}, productId=${productId}, sku=${sku}`,
      );

      return savedVariant;
    });
  }

  async findAllByProductId(productId: string): Promise<ProductVariant[]> {
    this.logger.debug(
      `[findAllByProductId] Fetching variants productId=${productId}`,
    );

    await this.productValidatorsService.ensureProductExists(productId);

    const result =
      await this.productVariantRepository.findAllByProductId(productId);

    this.logger.log(
      `[findAllByProductId] Found ${result.length} variants for productId=${productId}`,
    );

    return result;
  }

  async findOneActiveById(id: string, tx?: EntityManager) {
    this.logger.debug(`[findOneActiveById] Fetching variant id=${id}`);

    const variant = await this.productVariantRepository.findOneActiveById(
      id,
      tx,
    );

    if (!variant) {
      this.logger.warn(`[findOneActiveById] Variant not found id=${id}`);
    }

    this.logger.debug(`[findOneActiveById] Fetched variant id=${id}`);

    return variant;
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    this.logger.debug(`[update] Updating variant id=${id}`);

    return this.dataSource.transaction(async (tx) => {
      const existing = await this.productVariantRepository.findOneActiveById(
        id,
        tx,
      );

      if (!existing) {
        this.logger.warn(`[update] Variant not found id=${id}`);
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

        this.logger.debug(
          `[update] Validate prices id=${id}, price=${nextPrice}, salePrice=${nextSalePrice}`,
        );

        this.validatePrices(nextPrice, nextSalePrice);
      }

      let isDefault = existing.isDefault;

      if (updateProductVariantDto.isDefault === true && !existing.isDefault) {
        this.logger.debug(
          `[update] Set as default - unset others id=${id}, productId=${existing.productId}`,
        );

        await this.productVariantRepository.unsetDefaultVariant(
          existing.productId,
          tx,
        );

        isDefault = true;
      }

      if (updateProductVariantDto.isDefault === false && existing.isDefault) {
        this.logger.warn(
          `[update] Attempt to unset default without replacement id=${id}`,
        );

        throw new ConflictException(
          'Cannot unset default variant without assigning another one.',
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

        this.logger.debug(
          `[update] Recalculated id=${id}, stockStatus=${stockStatus}`,
        );
      }

      const updatePayload = sanitizeEntityInput(ProductVariantUpdateEntityDto, {
        ...updateProductVariantDto,
        ...(stockStatus && { stockStatus }),
        isDefault,
      });

      const savedVariant = await this.productVariantRepository.update(
        existing,
        updatePayload,
        tx,
      );

      await this.variantAttributesService.sync({
        productId: existing.productId,
        variantId: id,
        attributes: updateProductVariantDto.attributes,
        actor: updateProductVariantDto.updatedBy,
        tx,
      });

      this.logger.log(`[update] Updated variant id=${id}`);

      return savedVariant;
    });
  }

  private validatePrices(price: number, salePrice?: number | null) {
    if (salePrice && salePrice !== null && salePrice > price) {
      this.logger.warn(
        `[validatePrices] Invalid price price=${price}, salePrice=${salePrice}`,
      );

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
