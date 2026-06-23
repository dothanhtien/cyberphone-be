import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AdminVariantAttributesService } from './admin-variant-attributes.service';
import { AdminProductImagesService } from './admin-product-images.service';
import { AdminProductImageUploadService } from './admin-product-image-upload.service';
import { AdminProductValidatorsService } from './admin-product-validators.service';
import {
  CreateProductVariantDto,
  ProductVariantCreateEntityDto,
  ProductVariantListResponseDto,
  ProductVariantResponseDto,
  ProductVariantUpdateEntityDto,
  UpdateProductVariantDto,
} from './dto';
import {
  mapToProductVariantListResponse,
  mapToProductVariantResponse,
} from './mappers';
import {
  type IProductVariantRepository,
  PRODUCT_VARIANT_REPOSITORY,
} from '../repositories';
import { ProductVariantStockStatus } from '@/common/enums';
import { getErrorStack, sanitizeEntityInput } from '@/common/utils';
import { MediaAssetsService } from '@/media/media-assets.service';

@Injectable()
export class AdminProductVariantsService {
  private readonly logger = new Logger(AdminProductVariantsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly productVariantRepository: IProductVariantRepository,
    private readonly variantAttributesService: AdminVariantAttributesService,
    private readonly productValidatorsService: AdminProductValidatorsService,
    private readonly productImagesService: AdminProductImagesService,
    private readonly imageUploadService: AdminProductImageUploadService,
    private readonly mediaAssetsService: MediaAssetsService,
  ) {}

  async create(
    productId: string,
    createProductVariantDto: CreateProductVariantDto,
    images: Express.Multer.File[] = [],
  ) {
    const { sku } = createProductVariantDto;

    this.logger.debug(
      `[create] Creating variant productId=${productId}, sku=${sku}`,
    );

    this.validatePrices(
      createProductVariantDto.price,
      createProductVariantDto.salePrice,
    );

    const imageMetas = createProductVariantDto.imageMetas ?? [];

    this.productValidatorsService.validateImagesMetadata({
      imageMetas,
      images,
    });

    await this.productValidatorsService.ensureProductExists(productId);

    const uploadResults = images.length
      ? await this.imageUploadService.upload(images)
      : [];

    let savedVariantId: string;

    try {
      savedVariantId = await this.dataSource.transaction(async (tx) => {
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
          await this.productVariantRepository.unsetDefaultVariant(
            productId,
            tx,
          );
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

        const [, productImages] = await Promise.all([
          this.variantAttributesService.sync({
            productId,
            variantId: savedVariant.id,
            attributes: createProductVariantDto.attributes,
            actor: createProductVariantDto.createdBy,
            tx,
          }),
          this.productImagesService.create({
            productId,
            variantId: savedVariant.id,
            imageMetas,
            actor: createProductVariantDto.createdBy,
            tx,
          }),
        ]);

        if (productImages.length) {
          const mediaAssets = this.productImagesService.buildMediaAssets({
            productImages,
            imageMetas,
            uploadResults,
          });

          if (mediaAssets.length) {
            await this.mediaAssetsService.create(mediaAssets, tx);
          }
        }

        this.logger.debug(
          `[create] Created variant successful id=${savedVariant.id}, productId=${productId}, sku=${sku}`,
        );

        return savedVariant.id;
      });
    } catch (error) {
      if (uploadResults.length) {
        await this.imageUploadService.cleanup(uploadResults).catch((err) => {
          this.logger.error(
            `[create] Failed cleanup after error`,
            getErrorStack(err),
          );
        });
      }
      throw error;
    }

    return this.findOneById(savedVariantId);
  }

  async findAllByProductId(
    productId: string,
  ): Promise<ProductVariantListResponseDto[]> {
    this.logger.debug(
      `[findAllByProductId] Fetching variants productId=${productId}`,
    );

    await this.productValidatorsService.ensureProductExists(productId);

    const result =
      await this.productVariantRepository.findAllRawByProductId(productId);

    this.logger.log(
      `[findAllByProductId] Found ${result.length} variants for productId=${productId}`,
    );

    return result.map(mapToProductVariantListResponse);
  }

  async findOneById(id: string): Promise<ProductVariantResponseDto> {
    this.logger.debug(`[findOneById] Fetching variant id=${id}`);

    const variant = await this.productVariantRepository.findOneRawById(id);

    if (!variant) {
      this.logger.warn(`[findOneById] Variant not found id=${id}`);
      throw new NotFoundException('Variant not found');
    }

    this.logger.debug(`[findOneById] Fetched variant id=${id}`);

    return mapToProductVariantResponse(variant);
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

  async update(
    id: string,
    updateProductVariantDto: UpdateProductVariantDto,
    images: Express.Multer.File[] = [],
  ) {
    this.logger.debug(`[update] Updating variant id=${id}`);

    const imageMetas = updateProductVariantDto.imageMetas ?? [];

    this.productValidatorsService.validateImagesMetadata({
      imageMetas,
      images,
    });

    const uploadResults = images.length
      ? await this.imageUploadService.upload(images)
      : [];

    let savedVariantId: string;

    try {
      savedVariantId = await this.dataSource.transaction(async (tx) => {
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

        const updatePayload = sanitizeEntityInput(
          ProductVariantUpdateEntityDto,
          {
            ...updateProductVariantDto,
            ...(stockStatus && { stockStatus }),
            isDefault,
          },
        );

        const [savedVariant, , productImages] = await Promise.all([
          this.productVariantRepository.update(existing, updatePayload, tx),
          this.variantAttributesService.sync({
            productId: existing.productId,
            variantId: id,
            attributes: updateProductVariantDto.attributes,
            actor: updateProductVariantDto.updatedBy,
            tx,
          }),
          imageMetas.length
            ? this.productImagesService.sync({
                productId: existing.productId,
                variantId: id,
                imageMetas,
                actor: updateProductVariantDto.updatedBy,
                tx,
              })
            : Promise.resolve([]),
        ]);

        if (productImages.length) {
          const mediaAssets = this.productImagesService.buildMediaAssets({
            productImages,
            imageMetas,
            uploadResults,
          });

          if (mediaAssets.length) {
            await this.mediaAssetsService.create(mediaAssets, tx);
          }
        }

        this.logger.log(`[update] Updated variant id=${id}`);

        return savedVariant.id;
      });
    } catch (error) {
      if (uploadResults.length) {
        await this.imageUploadService.cleanup(uploadResults).catch((err) => {
          this.logger.error(
            `[update] Failed cleanup after error`,
            getErrorStack(err),
          );
        });
      }
      throw error;
    }

    return this.findOneById(savedVariantId);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug(`[delete] Deleting variant id=${id}`);

    await this.dataSource.transaction(async (tx) => {
      const existing = await this.productVariantRepository.findOneActiveById(
        id,
        tx,
      );

      if (!existing) {
        this.logger.warn(`[delete] Variant not found id=${id}`);
        throw new NotFoundException('Variant not found');
      }

      if (existing.isDefault) {
        const activeCount =
          await this.productVariantRepository.countActiveByProductId(
            existing.productId,
            tx,
          );

        if (activeCount > 1) {
          throw new ConflictException(
            'Cannot delete the default variant while other variants exist. Assign a new default first.',
          );
        }
      }

      await Promise.all([
        this.productVariantRepository.softDelete(id, tx),
        this.productImagesService.deactivateByVariantId(id, tx),
        this.variantAttributesService.deactivateByVariantId(id, tx),
      ]);

      this.logger.log(`[delete] Deleted variant id=${id}`);
    });
  }

  async reserveStock(
    items: { variantId: string; quantity: number }[],
    tx: EntityManager,
  ): Promise<void> {
    for (const { variantId, quantity } of items) {
      const ok = await this.productVariantRepository.decrementStock(
        variantId,
        quantity,
        tx,
      );

      if (!ok) {
        throw new UnprocessableEntityException(
          `Insufficient stock for variant ${variantId}`,
        );
      }
    }
  }

  async restoreStock(
    items: { variantId: string; quantity: number }[],
    tx: EntityManager,
  ): Promise<void> {
    await Promise.all(
      items.map(({ variantId, quantity }) =>
        this.productVariantRepository.restoreStock(variantId, quantity, tx),
      ),
    );
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
