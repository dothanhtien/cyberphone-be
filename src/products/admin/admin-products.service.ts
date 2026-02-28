import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { Product } from '@/products/entities/product.entity';
import { ProductCategory } from '@/products/entities/product-category.entity';
import { ProductImage } from '@/products/entities/product-image.entity';
import { CreateProductDto } from './dto/requests/create-product.dto';
import { UpdateProductDto } from './dto/requests/update-product.dto';
import {
  MediaAsset,
  MediaType,
} from '@/media-assets/entities/media-asset.entity';
import { ProductCreateEntityDto } from './dto/entity-inputs/product-create-entity.dto';
import { ProductUpdateEntityDto } from './dto/entity-inputs/product-update-entity.dto';
import { ProductImageCreateEntityDto } from './dto/entity-inputs/product-image-create-entity.dto';
import { ProductResponseDto } from './dto/responses/product-response.dto';
import { BrandsService } from '@/brands/brands.service';
import { CategoriesService } from '@/categories/categories.service';
import { sanitizeEntityInput } from '@/common/utils/entities';
import { extractPaginationParams } from '@/common/utils/paginations.util';
import { isUniqueConstraintError } from '@/common/utils/database-error.util';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { PaginatedEntity } from '@/common/types/paginations.type';
import { MediaAssetRefType } from '@/common/enums';
import { mapToProductResponse } from './mappers/product.mapper';
import { STORAGE_PROVIDER } from '@/storage/storage.module';
import type {
  StorageProvider,
  StorageUploadResult,
} from '@/storage/storage.provider';
import { PRODUCT_FOLDER } from '@/common/constants/paths';
import { ProductAttribute } from '../entities/product-attribute.entity';
import { ProductAttributeCreateEntityDto } from './dto/entity-inputs/product-attribute-create-entity.dto';

@Injectable()
export class AdminProductsService {
  private readonly logger = new Logger(AdminProductsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductAttribute)
    private readonly productAttributeRepository: Repository<ProductAttribute>,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    images: Express.Multer.File[] = [],
  ) {
    this.validateImagesInput(createProductDto, images);

    await Promise.all([
      this.assertSlugAvailable(createProductDto.slug),
      this.assertBrandExists(createProductDto.brandId),
      this.assertCategoriesValid(createProductDto.categoryIds),
    ]);

    let uploadResults: StorageUploadResult[] = [];
    let result: Product;
    try {
      uploadResults = await this.uploadImages(images);

      result = await this.dataSource.transaction(async (tx) => {
        const savedProduct = await this.createProductEntity(
          createProductDto,
          tx,
        );

        await this.syncProductCategories({
          productId: savedProduct.id,
          categoryIds: createProductDto.categoryIds,
          userId: createProductDto.createdBy,
          tx,
        });

        await this.insertProductAttributes(
          savedProduct,
          createProductDto.attributes,
          tx,
        );

        if (uploadResults.length) {
          await this.insertProductImagesAndMediaAssets(
            createProductDto,
            uploadResults,
            savedProduct,
            tx,
          );
        }

        return savedProduct;
      });
    } catch (error) {
      this.logger.error(
        `Failed to create product slug=${createProductDto.slug}`,
        error,
      );

      await this.cleanupUploads(uploadResults);
      throw error;
    }

    return this.findOne(result.id);
  }

  async findAll(
    getProductsDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<ProductResponseDto>> {
    const { page, limit } = extractPaginationParams(getProductsDto);

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.categories', 'productCategory')
      .leftJoinAndSelect('productCategory.category', 'category')
      .leftJoinAndMapMany(
        'product.productImages',
        ProductImage,
        'pi',
        'pi.productId = product.id AND pi.is_active = true',
      )
      .leftJoinAndMapOne(
        'pi.media',
        MediaAsset,
        'media',
        `
          media.ref_id::uuid = pi.id
          AND media.ref_type = :refType
          AND media.deleted_at IS NULL
        `,
        { refType: MediaAssetRefType.PRODUCT_IMAGE },
      )
      .where('product.isActive = :isActive', { isActive: true })
      .orderBy('product.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [products, totalCount] = await Promise.all([
      query.getMany(),
      this.productRepository.count({
        where: { isActive: true },
      }),
    ]);

    return {
      items: products.map(mapToProductResponse),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.categories', 'productCategory')
      .leftJoinAndSelect('productCategory.category', 'category')
      .leftJoinAndSelect('product.productImages', 'pi', 'pi.isActive = true')
      .leftJoinAndMapOne(
        'pi.media',
        MediaAsset,
        'media',
        `
          media.ref_id::uuid = pi.id
          AND media.ref_type = :refType
          AND media.deleted_at IS NULL
        `,
        { refType: MediaAssetRefType.PRODUCT_IMAGE },
      )
      .where('product.id = :id', { id })
      .andWhere('product.isActive = true')
      .getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return mapToProductResponse(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.assertBrandExists(updateProductDto.brandId);

    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      await this.assertSlugAvailable(updateProductDto.slug, id);
    }

    await this.dataSource.transaction(async (tx) => {
      const productInput = sanitizeEntityInput(
        ProductUpdateEntityDto,
        updateProductDto,
      );

      await tx.update(Product, id, {
        ...productInput,
        updatedBy: updateProductDto.updatedBy,
      });

      if (updateProductDto.categoryIds) {
        await this.assertCategoriesValid(updateProductDto.categoryIds, tx);

        await this.syncProductCategories({
          productId: id,
          categoryIds: updateProductDto.categoryIds,
          userId: updateProductDto.updatedBy,
          tx,
        });
      }
    });

    return this.findOne(id);
  }

  async findAttributes(productId: string) {
    const exists = await this.productRepository.exists({
      where: { id: productId, isActive: true },
    });

    if (!exists) {
      throw new NotFoundException('Product not found');
    }

    return this.productAttributeRepository.find({
      where: {
        productId,
        isActive: true,
      },
      order: { displayOrder: 'ASC' },
    });
  }

  private async assertBrandExists(brandId?: string) {
    if (!brandId) return;

    const exists = await this.brandsService.exists(brandId);

    if (!exists) {
      throw new NotFoundException('Brand not found');
    }
  }

  private async assertSlugAvailable(slug: string, productId?: string) {
    const existing = await this.productRepository.findOne({
      where: {
        slug,
        isActive: true,
        ...(productId && { id: Not(productId) }),
      },
    });

    if (existing) {
      throw new ConflictException('Slug already exists');
    }
  }

  private async assertCategoriesValid(
    categoryIds: string[],
    tx?: EntityManager,
  ) {
    const categories = await this.categoriesService.findActiveByIds(
      categoryIds,
      tx,
    );

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException(
        'One or more categories are invalid or inactive',
      );
    }
  }

  private async syncProductCategories({
    productId,
    categoryIds,
    userId,
    tx,
  }: {
    productId: string;
    categoryIds: string[];
    userId: string;
    tx: EntityManager;
  }) {
    await tx.update(
      ProductCategory,
      { productId },
      {
        isActive: false,
        updatedBy: userId,
      },
    );

    await tx
      .createQueryBuilder()
      .update(ProductCategory)
      .set({
        isActive: true,
        updatedBy: userId,
      })
      .where('product_id = :productId', { productId })
      .andWhere('category_id IN (:...categoryIds)', { categoryIds })
      .execute();

    await tx
      .createQueryBuilder()
      .insert()
      .into(ProductCategory)
      .values(
        categoryIds.map((categoryId) => ({
          productId,
          categoryId,
          isActive: true,
          createdBy: userId,
        })),
      )
      .orIgnore()
      .execute();
  }

  private validateImagesInput(
    createProductDto: CreateProductDto,
    images: Express.Multer.File[],
  ) {
    if (!images.length) return;

    if (!Array.isArray(createProductDto.imageMetas)) {
      throw new BadRequestException(
        'imageMetas is required when uploading images',
      );
    }

    if (createProductDto.imageMetas.length !== images.length) {
      throw new BadRequestException(
        'Images and imageMetas must have the same length',
      );
    }
  }

  private async uploadImages(images?: Express.Multer.File[]) {
    if (!images?.length) return [];

    try {
      return await Promise.all(
        images.map((file) =>
          this.storageProvider.upload(file, {
            folder: PRODUCT_FOLDER,
          }),
        ),
      );
    } catch (error) {
      this.logger.error(`Image upload failed`, error);
      throw new BadRequestException('Image upload failed');
    }
  }

  private async createProductEntity(
    createProductDto: CreateProductDto,
    tx: EntityManager,
  ): Promise<Product> {
    try {
      const product = tx.create(Product, {
        ...sanitizeEntityInput(ProductCreateEntityDto, createProductDto),
        createdBy: createProductDto.createdBy,
      });

      return await tx.save(product);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        this.logger.warn(`Unique constraint violation on slug`);
        throw new ConflictException('Slug already exists');
      }
      this.logger.error(`Failed to create product entity`, error);
      throw error;
    }
  }

  private async insertProductImagesAndMediaAssets(
    createProductDto: CreateProductDto,
    uploadResults: StorageUploadResult[],
    savedProduct: Product,
    tx: EntityManager,
  ) {
    const imageMetas = createProductDto.imageMetas;

    const productImages = uploadResults.map((_, index) => {
      const meta = imageMetas[index];

      const productImageInput = sanitizeEntityInput(
        ProductImageCreateEntityDto,
        {
          productId: savedProduct.id,
          variantId: null,
          imageType: meta.imageType,
          altText: meta.altText,
          title: meta.title,
          displayOrder: meta.displayOrder ?? index,
          isActive: true,
          createdBy: savedProduct.createdBy,
        },
      );

      return tx.create(ProductImage, productImageInput);
    });

    const savedProductImages = await tx.save(ProductImage, productImages);

    const mediaAssets = savedProductImages.map((image, index) => {
      const upload = uploadResults[index];

      return tx.create(MediaAsset, {
        publicId: upload.key,
        url: upload.url,
        resourceType: upload.resourceType as MediaType,
        refType: MediaAssetRefType.PRODUCT_IMAGE,
        refId: image.id,
        createdBy: savedProduct.createdBy,
      });
    });

    await tx.save(MediaAsset, mediaAssets);
  }

  private async insertProductAttributes(
    product: Product,
    attributes: CreateProductDto['attributes'],
    tx: EntityManager,
  ) {
    if (!attributes?.length) return;

    const entities = attributes.map((attr) => {
      const entityInput = sanitizeEntityInput(ProductAttributeCreateEntityDto, {
        ...attr,
        productId: product.id,
        createdBy: product.createdBy,
      });

      return tx.create(ProductAttribute, entityInput);
    });

    await tx.save(ProductAttribute, entities);
  }

  private async cleanupUploads(uploads: StorageUploadResult[]) {
    if (!uploads.length) return;

    await Promise.all(
      uploads.map(async (file) => {
        try {
          await this.storageProvider.delete(file.key);
        } catch (error) {
          this.logger.error(
            `Failed to cleanup uploaded file: ${file.key}`,
            error,
          );
        }
      }),
    );
  }
}
