import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminProductAttributesService } from './admin-product-attributes.service';
import { AdminProductCategoriesService } from './admin-product-categories.service';
import { AdminProductImagesService } from './admin-product-images.service';
import { AdminProductImageUploadService } from './admin-product-image-upload.service';
import { AdminProductValidatorsService } from './admin-product-validators.service';
import {
  CreateProductDto,
  ProductCreateEntityDto,
  ProductResponseDto,
  ProductUpdateEntityDto,
  UpdateProductDto,
} from './dto';
import { mapToProductResponseFromProductRaw } from './mappers';
import { Product } from '../entities';
import { type IProductRepository, PRODUCT_REPOSITORY } from '../repositories';
import { PaginationQueryDto } from '@/common/dto';
import { PaginatedEntity } from '@/common/types';
import {
  extractPaginationParams,
  getErrorStack,
  sanitizeEntityInput,
} from '@/common/utils';
import { MediaAssetsService } from '@/media/media-assets.service';

@Injectable()
export class AdminProductsService {
  private readonly logger = new Logger(AdminProductsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly productCategoriesService: AdminProductCategoriesService,
    private readonly productImagesService: AdminProductImagesService,
    private readonly productAttributesService: AdminProductAttributesService,
    private readonly productValidatorsService: AdminProductValidatorsService,
    private readonly mediaAssetsService: MediaAssetsService,
    private readonly imageUploadService: AdminProductImageUploadService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    images: Express.Multer.File[] = [],
  ) {
    this.logger.log(`[create] Creating product slug=${createProductDto.slug}`);

    const imageMetas = createProductDto.imageMetas ?? [];

    this.logger.debug(
      `[create] Validating images metadata count=${imageMetas.length}`,
    );

    this.productValidatorsService.validateImagesMetadata({
      imageMetas,
      images,
    });

    this.logger.debug(
      `[create] Validating constraints slug=${createProductDto.slug}`,
    );

    await Promise.all([
      this.productValidatorsService.ensureSlugNotTaken(createProductDto.slug),
      this.productValidatorsService.ensureBrandExists(createProductDto.brandId),
      this.productValidatorsService.ensureCategoriesExist(
        createProductDto.categoryIds,
      ),
    ]);

    const uploadResults = images.length
      ? await this.imageUploadService.upload(images)
      : [];

    this.logger.debug(`[create] Images uploaded count=${uploadResults.length}`);

    let result: Product;

    try {
      result = await this.dataSource.transaction(async (tx) => {
        this.logger.debug(
          `[create] Transaction started slug=${createProductDto.slug}`,
        );

        const product = await this.productRepository.create(
          sanitizeEntityInput(ProductCreateEntityDto, createProductDto),
          tx,
        );

        const { id: productId, createdBy } = product;

        this.logger.debug(`[create] Product created productId=${productId}`);

        const [, , productImages] = await Promise.all([
          this.productCategoriesService.create({
            productId,
            categoryIds: createProductDto.categoryIds,
            tx,
          }),
          this.productAttributesService.create({
            productId,
            attributes: createProductDto.attributes ?? [],
            actor: createdBy,
            tx,
          }),
          this.productImagesService.create({
            productId,
            imageMetas,
            actor: createdBy,
            tx,
          }),
        ]);

        this.logger.debug(`[create] Relations created productId=${productId}`);

        const mediaAssets = this.productImagesService.buildMediaAssets({
          productImages,
          imageMetas,
          uploadResults,
        });

        if (mediaAssets.length) {
          await this.mediaAssetsService.create(mediaAssets, tx);

          this.logger.debug(
            `[create] Media assets created count=${mediaAssets.length} productId=${productId}`,
          );
        }

        this.logger.debug(
          `[create] Transaction completed productId=${productId}`,
        );

        return product;
      });
    } catch (error) {
      this.logger.error(
        `[create] Failed to create product slug=${createProductDto.slug}`,
        getErrorStack(error),
      );
      throw error;
    }

    this.logger.log(
      `[create] Product created successfully productId=${result.id}`,
    );

    return { id: result.id };
  }

  async findAll(
    getProductsDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<ProductResponseDto>> {
    const { page, limit } = extractPaginationParams(getProductsDto);
    const offset = (page - 1) * limit;

    this.logger.debug(
      `[findAll] Fetching products page=${page}, limit=${limit}`,
    );

    const [products, totalCount] = await Promise.all([
      this.productRepository.findAllRaw(limit, offset),
      this.productRepository.countActive(),
    ]);

    this.logger.log(
      `[findAll] Fetched products page=${page}, count=${products.length}, total=${totalCount}`,
    );

    return {
      items: products.map(mapToProductResponseFromProductRaw),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    this.logger.debug(`[findOne] Fetching productId=${id}`);

    const product = await this.productRepository.findOneRaw(id);

    if (!product) {
      this.logger.warn(`[findOne] Product not found productId=${id}`);
      throw new NotFoundException('Product not found');
    }

    this.logger.log(`[findOne] Product fetched successfully productId=${id}`);

    return mapToProductResponseFromProductRaw(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    images: Express.Multer.File[] = [],
  ) {
    this.logger.log(`[update] Updating product productId=${id}`);

    const product = await this.productRepository.findActiveById(id);

    if (!product) {
      this.logger.warn(`[update] Product not found productId=${id}`);
      throw new NotFoundException('Product not found');
    }

    await this.productValidatorsService.validateUpdateConstraints(
      updateProductDto,
      product,
      images,
    );

    const uploadResults = images.length
      ? await this.imageUploadService.upload(images)
      : [];

    this.logger.debug(
      `[update] Images uploaded count=${uploadResults.length} productId=${id}`,
    );

    try {
      await this.dataSource.transaction(async (tx) => {
        this.logger.debug(`[update] Transaction started productId=${id}`);

        await this.productRepository.update(
          id,
          sanitizeEntityInput(ProductUpdateEntityDto, updateProductDto),
          tx,
        );

        const [, , productImages] = await Promise.all([
          updateProductDto.categoryIds?.length
            ? this.productCategoriesService.sync({
                productId: product.id,
                categoryIds: updateProductDto.categoryIds,
                tx,
              })
            : Promise.resolve(),
          updateProductDto.attributes?.length
            ? this.productAttributesService.sync({
                productId: product.id,
                attributes: updateProductDto.attributes,
                actor: updateProductDto.updatedBy,
                tx,
              })
            : Promise.resolve(),
          updateProductDto.imageMetas?.length
            ? this.productImagesService.sync({
                imageMetas: updateProductDto.imageMetas,
                productId: product.id,
                actor: updateProductDto.updatedBy,
                tx,
              })
            : Promise.resolve([]),
        ]);

        this.logger.debug(`[update] Relations synced productId=${id}`);

        if (productImages.length) {
          const mediaAssets = this.productImagesService.buildMediaAssets({
            productImages,
            imageMetas: updateProductDto.imageMetas ?? [],
            uploadResults,
          });

          if (mediaAssets.length) {
            await this.mediaAssetsService.create(mediaAssets, tx);
          }

          this.logger.debug(
            `[update] Media processed count=${mediaAssets.length} productId=${id}`,
          );
        }

        this.logger.debug(`[update] Transaction completed productId=${id}`);
      });
    } catch (error) {
      this.logger.error(
        `[update] Failed to update product productId=${id}`,
        getErrorStack(error),
      );
      throw error;
    }

    this.logger.log(`[update] Product updated successfully productId=${id}`);

    return { id };
  }

  exists(id: string): Promise<boolean> {
    return this.productRepository.existsActiveById(id);
  }
}
