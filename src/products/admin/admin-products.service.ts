import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductUpdateEntityDto,
  ProductResponseDto,
} from './dto';
import { AdminProductImagesService } from './admin-product-images.service';
import { AdminProductAttributesService } from './admin-product-attributes.service';
import { AdminProductCategoriesService } from './admin-product-categories.service';
import { AdminProductValidatorsService } from './admin-product-validators.service';
import { AdminProductImageUploadService } from './admin-product-image-upload.service';
import { mapToProductResponseFromProductRaw } from './mappers';
import { type IProductRepository, PRODUCT_REPOSITORY } from './repositories';
import { MediaAssetsService } from '@/media/media-assets.service';
import { PaginationQueryDto } from '@/common/dto';
import { PaginatedEntity } from '@/common/types';
import { extractPaginationParams, sanitizeEntityInput } from '@/common/utils';

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
    this.logger.log(
      `[create] Start creating product slug=${createProductDto.slug}`,
    );

    const imageMetas = createProductDto.imageMetas ?? [];

    this.productValidatorsService.validateImagesMetadata({
      imageMetas,
      images,
    });

    await Promise.all([
      this.productValidatorsService.ensureSlugNotTaken(createProductDto.slug),
      this.productValidatorsService.ensureBrandExists(createProductDto.brandId),
      this.productValidatorsService.ensureCategoriesExistAndActive(
        createProductDto.categoryIds,
      ),
    ]);

    const uploadResults = images.length
      ? await this.imageUploadService.upload(images)
      : [];

    const result = await this.dataSource.transaction(async (tx) => {
      const product = await this.productRepository.create(createProductDto, tx);

      const { id: productId, createdBy } = product;

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

      const mediaAssets = this.productImagesService.buildMediaAssets({
        productImages,
        imageMetas,
        uploadResults,
      });

      if (mediaAssets.length) {
        await this.mediaAssetsService.create(mediaAssets, tx);
      }

      return product;
    });

    this.logger.log(`[create] Product created successfully id=${result.id}`);

    return { id: result.id };
  }

  async findAll(
    getProductsDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<ProductResponseDto>> {
    const { page, limit } = extractPaginationParams(getProductsDto);
    const offset = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      this.productRepository.findAllRaw(limit, offset),
      this.productRepository.countActive(),
    ]);

    return {
      items: products.map(mapToProductResponseFromProductRaw),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneRaw(id);

    if (!product) {
      this.logger.warn(`Product not found id=${id}`);
      throw new NotFoundException('Product not found');
    }

    return mapToProductResponseFromProductRaw(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    images: Express.Multer.File[] = [],
  ) {
    this.logger.log(`[update] Start updating product id=${id}`);

    const product = await this.productRepository.findActiveById(id);

    if (!product) {
      this.logger.warn(`[update] Product not found id=${id}`);
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

    await this.dataSource.transaction(async (tx) => {
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
        images.length
          ? this.productImagesService.sync({
              imageMetas: updateProductDto.imageMetas ?? [],
              productId: product.id,
              actor: updateProductDto.updatedBy,
              tx,
            })
          : Promise.resolve([]),
      ]);

      if (productImages.length) {
        const mediaAssets = this.productImagesService.buildMediaAssets({
          productImages,
          imageMetas: updateProductDto.imageMetas ?? [],
          uploadResults,
        });

        if (mediaAssets.length) {
          await this.mediaAssetsService.create(mediaAssets, tx);
        }
      }
    });

    this.logger.log(`[update] Product updated successfully id=${id}`);

    return { id };
  }
}
