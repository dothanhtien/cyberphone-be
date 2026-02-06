import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/requests/create-product.dto';
import { BrandsService } from '@/brands/brands.service';
import { CategoriesService } from '@/categories/categories.service';
import { sanitizeEntityInput } from '@/common/utils/entities';
import { normalizeSlug } from '@/common/utils/slugs';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { PaginatedEntity } from '@/common/types/paginations.type';
import {
  buildPaginationParams,
  extractPaginationParams,
} from '@/common/utils/paginations.util';
import { UpdateProductDto } from './dto/requests/update-product.dto';
import { ProductCategory } from './entities/product-category.entity';
import { mapToProductResponse } from './mappers/product.mapper';
import { ProductCreateEntityDto } from './dto/entity-inputs/product-create-entity.dto';
import { ProductResponseDto } from './dto/responses/product-response.dto';
import { ProductUpdateEntityDto } from './dto/entity-inputs/product-update-entity.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    createProductDto.slug = normalizeSlug(createProductDto.slug);

    await this.assertBrandExists(createProductDto.brandId);

    await this.assertSlugAvailable(createProductDto.slug);

    return this.dataSource.transaction(async (tx) => {
      const productInput = sanitizeEntityInput(
        ProductCreateEntityDto,
        createProductDto,
      );

      const product = tx.create(Product, {
        ...productInput,
        createdBy: createProductDto.createdBy,
      });

      await tx.save(product);

      if (createProductDto.categoryIds.length) {
        await this.assertCategoriesValid(createProductDto.categoryIds, tx);

        await this.syncProductCategories({
          productId: product.id,
          categoryIds: createProductDto.categoryIds,
          userId: createProductDto.createdBy,
          tx,
        });
      }

      const result = await tx.findOne(Product, {
        where: { id: product.id },
        relations: {
          brand: true,
          categories: {
            category: true,
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Product not found');
      }

      return mapToProductResponse(result);
    });
  }

  async findAll(
    getProductsDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<ProductResponseDto>> {
    const { page, limit } = extractPaginationParams(getProductsDto);

    const [products, totalCount] = await this.productRepository.findAndCount({
      where: { isActive: true },
      ...buildPaginationParams(page, limit),
      order: { updatedAt: 'DESC' },
    });

    return {
      items: products.map(mapToProductResponse),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: {
        brand: true,
        categories: { category: true },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return mapToProductResponse(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (updateProductDto.slug) {
      updateProductDto.slug = normalizeSlug(updateProductDto.slug);
    }

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

    return this.dataSource.transaction(async (tx) => {
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

      const result = await tx.findOne(Product, {
        where: { id },
        relations: {
          brand: true,
          categories: { category: true },
        },
      });

      if (!result) {
        throw new NotFoundException('Product not found');
      }

      return mapToProductResponse(result);
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
    tx: EntityManager,
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
}
