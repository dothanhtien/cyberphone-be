import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';
import {
  Product,
  ProductAttribute,
  ProductCategory,
  ProductImage,
} from '@/products/entities';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductCreateEntityDto,
  ProductUpdateEntityDto,
  ProductImageCreateEntityDto,
  ProductResponseDto,
  ProductAttributeCreateEntityDto,
  CreateProductAttributeDto,
} from './dto';
import { MediaAsset } from '@/media/entities';
import { BrandsService } from '@/brands/brands.service';
import { CategoriesService } from '@/categories/categories.service';
import {
  extractPaginationParams,
  getErrorStack,
  isUniqueConstraintError,
  sanitizeEntityInput,
} from '@/common/utils';
import { PaginationQueryDto } from '@/common/dto';
import { PaginatedEntity } from '@/common/types';
import {
  MediaAssetRefType,
  MediaAssetUsageType,
  ProductImageType,
} from '@/common/enums';
import { mapToProductResponseFromProductRaw } from './mappers';
import { STORAGE_PROVIDER } from '@/storage/storage.module';
import type {
  StorageProvider,
  StorageUploadResult,
} from '@/storage/storage.provider';
import { PRODUCT_FOLDER } from '@/common/constants';
import { ProductRaw } from './types';

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
    this.logger.log(`Creating product slug=${createProductDto.slug}`);
    this.logger.debug(`Payload: ${JSON.stringify(createProductDto)}`);

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

      this.logger.debug(`Uploaded ${uploadResults.length} images`);

      result = await this.dataSource.transaction(async (tx) => {
        this.logger.debug(`Transaction started for product create`);

        const savedProduct = await this.createProductEntity(
          createProductDto,
          tx,
        );

        this.logger.debug(`Product created id=${savedProduct.id}`);

        await Promise.all([
          this.insertProductCategories({
            productId: savedProduct.id,
            categoryIds: createProductDto.categoryIds,
            tx,
          }),
          this.insertProductAttributes(
            savedProduct,
            createProductDto.attributes,
            tx,
          ),
          this.insertProductImagesAndMediaAssets(
            createProductDto,
            uploadResults,
            savedProduct,
            tx,
          ),
        ]);

        return savedProduct;
      });

      this.logger.log(`Product created successfully id=${result.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to create product slug=${createProductDto.slug}`,
        getErrorStack(error),
      );

      await this.cleanupUploads(uploadResults);
      throw error;
    }

    return { id: result.id };
  }

  async findAll(
    getProductsDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<ProductResponseDto>> {
    const { page, limit } = extractPaginationParams(getProductsDto);

    const query = this.productRepository.query<ProductRaw[]>(
      `
        SELECT 
          p.id,
          p.name,
          p.slug,
          p.status,
          p.is_featured AS "isFeatured",
          p.is_bestseller AS "isBestseller",
          p.is_active AS "isActive",
          p.created_at AS "createdAt",
          p.created_by AS "createdBy",
          p.updated_at AS "updatedAt",
          p.updated_by AS "updatedBy",
          json_build_object('id', b.id, 'name', b.name) AS brand,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', c.id, 'name', c.name)
            ) FILTER (WHERE c.id IS NOT NULL), '[]'
          ) AS categories,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pi.id, 
                'imageType', pi.image_type, 
                'altText', pi.alt_text, 
                'url', m.url
              )
            ) FILTER (WHERE pi.id IS NOT NULL), '[]'
          ) AS images,
          COUNT(DISTINCT pv.id) AS "variantCount"
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id AND b.is_active = true
        LEFT JOIN product_categories pc ON pc.product_id = p.id
        LEFT JOIN categories c ON c.id = pc.category_id AND c.is_active = true
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.image_type = $1 AND pi.is_active = true
        LEFT JOIN media_assets m ON m.ref_type = $2 AND m.ref_id::uuid = pi.id AND m.is_active = true
        LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = true
        WHERE p.is_active = true
        GROUP BY p.id, b.id
        ORDER BY COALESCE(p.updated_at, p.created_at) DESC
        LIMIT $3 OFFSET $4
      `,
      [
        ProductImageType.MAIN,
        MediaAssetRefType.PRODUCT,
        limit,
        (page - 1) * limit,
      ],
    );

    const [products, totalCount] = await Promise.all([
      query,
      this.productRepository.count({ where: { isActive: true } }),
    ]);

    return {
      items: products.map(mapToProductResponseFromProductRaw),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    this.logger.debug(`Fetching product id=${id}`);

    const products = await this.productRepository.query<ProductRaw[]>(
      `
        SELECT 
          p.id,
          p.name,
          p.slug,
          p.status,
          p.short_description AS "shortDescription",
          p.long_description AS "longDescription",
          p.is_featured AS "isFeatured",
          p.is_bestseller AS "isBestseller",
          p.is_active AS "isActive",
          p.created_at AS "createdAt",
          p.created_by AS "createdBy",
          p.updated_at AS "updatedAt",
          p.updated_by AS "updatedBy",
          json_build_object('id', b.id, 'name', b.name) AS brand,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', c.id, 'name', c.name)
            ) FILTER (WHERE c.id IS NOT NULL), '[]'
          ) AS categories,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pi.id, 
                'imageType', pi.image_type, 
                'altText', pi.alt_text, 
                'url', m.url
              )
            ) FILTER (WHERE pi.id IS NOT NULL), '[]'
          ) AS images,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pa.id,
                'attributeKey', pa.attribute_key,
                'attributeKeyDisplay', pa.attribute_key_display,
                'displayOrder', pa.display_order
              )
            ) FILTER (WHERE pa.id IS NOT NULL), '[]'
          ) AS attributes
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id AND b.is_active = true
        LEFT JOIN product_categories pc ON pc.product_id = p.id
        LEFT JOIN categories c ON c.id = pc.category_id AND c.is_active = true
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.image_type = $1 AND pi.is_active = true
        LEFT JOIN media_assets m ON m.ref_type = $2 AND m.ref_id::uuid = pi.id AND m.is_active = true
        LEFT JOIN product_attributes pa ON pa.product_id = p.id AND pa.is_active = true
        WHERE p.id = $3 AND p.is_active = true
        GROUP BY p.id, b.id
      `,
      [ProductImageType.MAIN, MediaAssetRefType.PRODUCT, id],
    );

    const product = products[0];

    if (!product) {
      this.logger.warn(`Product not found id=${id}`);
      throw new NotFoundException('Product not found');
    }

    return mapToProductResponseFromProductRaw(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    this.logger.log(`Updating product id=${id}`);
    this.logger.debug(`Payload: ${JSON.stringify(updateProductDto)}`);

    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      this.logger.warn(`Product not found id=${id}`);
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.brandId) {
      await this.assertBrandExists(updateProductDto.brandId);
    }

    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      await this.assertSlugAvailable(updateProductDto.slug, id);
    }

    await this.dataSource.transaction(async (tx) => {
      this.logger.debug(`Transaction started for update id=${id}`);

      const productInput = sanitizeEntityInput(
        ProductUpdateEntityDto,
        updateProductDto,
      );

      await tx.update(Product, id, productInput);

      if (Array.isArray(updateProductDto.categoryIds)) {
        await this.assertCategoriesValid(updateProductDto.categoryIds, tx);

        await this.syncProductCategories({
          productId: product.id,
          categoryIds: updateProductDto.categoryIds,
          tx,
        });
      }

      if (Array.isArray(updateProductDto.attributes)) {
        this.logger.debug(
          `Syncing attributes count=${updateProductDto.attributes.length}`,
        );

        await this.syncProductAttributes({
          productId: product.id,
          attributes: updateProductDto.attributes,
          actor: updateProductDto.updatedBy,
          tx,
        });
      }
    });

    this.logger.log(`Product updated successfully id=${id}`);

    return true;
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

  private async assertBrandExists(brandId: string) {
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

  private async insertProductCategories({
    productId,
    categoryIds,
    tx,
  }: {
    productId: string;
    categoryIds: string[];
    tx: EntityManager;
  }) {
    if (!categoryIds.length) return;

    const uniqueCategoryIds = [...new Set(categoryIds)];

    await tx.insert(
      ProductCategory,
      uniqueCategoryIds.map((categoryId) => ({
        productId,
        categoryId,
      })),
    );
  }

  private async syncProductCategories({
    productId,
    categoryIds,
    tx,
  }: {
    productId: string;
    categoryIds: string[];
    tx: EntityManager;
  }) {
    const existing = await tx.find(ProductCategory, {
      where: { productId },
      select: ['categoryId'],
    });

    const currentIds = new Set(existing.map((e) => e.categoryId));
    const incomingIds = new Set(categoryIds);

    const isSame =
      currentIds.size === incomingIds.size &&
      [...currentIds].every((id) => incomingIds.has(id));

    if (isSame) return;

    const toDelete = [...currentIds].filter((id) => !incomingIds.has(id));
    const toInsert = [...incomingIds].filter((id) => !currentIds.has(id));

    if (toDelete.length) {
      await tx.delete(ProductCategory, {
        productId,
        categoryId: In(toDelete),
      });
    }

    if (toInsert.length) {
      await tx.insert(
        ProductCategory,
        toInsert.map((categoryId) => ({
          productId,
          categoryId,
        })),
      );
    }
  }

  private async syncProductAttributes({
    productId,
    attributes,
    actor,
    tx,
  }: {
    productId: string;
    attributes: CreateProductAttributeDto[];
    actor: string;
    tx: EntityManager;
  }) {
    this.logger.debug(
      `Sync attributes for product=${productId}, incoming=${attributes.length}`,
    );

    const existing = await tx.find(ProductAttribute, {
      where: { productId },
    });

    const existingMap = new Map(existing.map((e) => [e.id, e]));
    const incomingIds = new Set(
      attributes.filter((a) => a.id).map((a) => a.id!),
    );

    const toRemove = existing.filter((e) => !incomingIds.has(e.id));

    if (toRemove.length) {
      this.logger.debug(`Removing attributes count=${toRemove.length}`);

      const ids = toRemove.map((i) => i.id);

      const usedAttributes = await tx
        .createQueryBuilder()
        .select('va.productAttributeId', 'id')
        .from('variant_attributes', 'va')
        .where('va.productAttributeId IN (:...ids)', { ids })
        .groupBy('va.productAttributeId')
        .getRawMany<{ id: string }>();

      const usedSet = new Set(usedAttributes.map((u) => u.id));

      const toSoftDelete = ids.filter((id) => usedSet.has(id));
      const toHardDelete = ids.filter((id) => !usedSet.has(id));

      if (toSoftDelete.length) {
        this.logger.debug(
          `Soft deleting attributes count=${toSoftDelete.length}`,
        );

        await tx.update(
          ProductAttribute,
          { id: In(toSoftDelete) },
          {
            isActive: false,
            updatedBy: actor,
          },
        );
      }

      if (toHardDelete.length) {
        this.logger.debug(
          `Hard deleting attributes count=${toHardDelete.length}`,
        );

        await tx.delete(ProductAttribute, {
          id: In(toHardDelete),
        });
      }
    }

    for (const attr of attributes) {
      if (attr.id && existingMap.has(attr.id)) {
        await tx.update(ProductAttribute, attr.id, {
          attributeKey: attr.attributeKey,
          attributeKeyDisplay: attr.attributeKeyDisplay,
          displayOrder: attr.displayOrder,
          updatedBy: actor,
          isActive: true,
        });
      } else {
        await tx.insert(ProductAttribute, {
          productId,
          attributeKey: attr.attributeKey,
          attributeKeyDisplay: attr.attributeKeyDisplay,
          displayOrder: attr.displayOrder,
          createdBy: actor,
          isActive: true,
        });
      }
    }
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

    this.logger.debug(`Uploading ${images.length} images`);

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
    if (!uploadResults.length) return;

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

    const mediaAssets = savedProductImages.map((productImage, index) => {
      const meta = imageMetas[index];
      const upload = uploadResults[index];

      return tx.create(MediaAsset, {
        publicId: upload.key,
        url: upload.url,
        resourceType: upload.resourceType,
        refType: MediaAssetRefType.PRODUCT,
        refId: productImage.id,
        usageType: (meta.imageType ??
          MediaAssetUsageType.OTHER) as MediaAssetUsageType,
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

    this.logger.warn(`Cleaning up ${uploads.length} uploaded files`);

    await Promise.all(
      uploads.map(async (file) => {
        try {
          await this.storageProvider.delete(file.key);
        } catch (error) {
          this.logger.error(
            `Failed to cleanup uploaded file: ${file.key}`,
            getErrorStack(error),
          );
        }
      }),
    );
  }
}
