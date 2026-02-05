import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
    private readonly dataSource: DataSource,
  ) {}

  async create({
    createProductDto,
    loggedInUserId,
  }: {
    createProductDto: CreateProductDto;
    loggedInUserId: string;
  }) {
    createProductDto.slug = normalizeSlug(createProductDto.slug);

    const brandExists = await this.brandsService.exists(
      createProductDto.brandId,
    );

    if (!brandExists) {
      throw new NotFoundException('Brand not found');
    }

    const existingProduct = await this.productRepository.findOne({
      where: {
        slug: createProductDto.slug,
        isActive: true,
      },
    });

    if (existingProduct) {
      throw new ConflictException('Slug already exists');
    }

    return this.dataSource.transaction(async (tx) => {
      const productInput = sanitizeEntityInput(
        ProductCreateEntityDto,
        createProductDto,
      );

      const product = tx.create(Product, {
        ...productInput,
        createdBy: loggedInUserId,
      });

      await tx.save(product);

      if (createProductDto.categoryIds.length) {
        const categories = await this.categoriesService.findActiveByIds(
          createProductDto.categoryIds,
          tx,
        );

        if (categories.length !== createProductDto.categoryIds.length) {
          throw new BadRequestException(
            'One or more categories are invalid or inactive',
          );
        }

        const productCategories = createProductDto.categoryIds.map(
          (categoryId) =>
            tx.create(ProductCategory, {
              productId: product.id,
              categoryId,
              createdBy: loggedInUserId,
            }),
        );

        await tx.save(productCategories);
      }

      const result = await tx.findOne(Product, {
        where: { id: product.id },
        relations: {
          brand: true,
          productCategories: {
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
  ): Promise<PaginatedEntity<Product>> {
    const { page, limit } = extractPaginationParams(getProductsDto);

    const [products, totalCount] = await this.productRepository.findAndCount({
      where: { isActive: true },
      ...buildPaginationParams(page, limit),
      order: { updatedAt: 'DESC' },
    });

    return {
      items: products,
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.slug) {
      updateProductDto.slug = normalizeSlug(updateProductDto.slug);

      const existingProduct = await this.productRepository.findOne({
        where: {
          slug: updateProductDto.slug,
          isActive: true,
        },
      });

      if (existingProduct && existingProduct.id !== product.id) {
        throw new ConflictException('Slug already exists');
      }
    }

    if (updateProductDto.brandId) {
      const brandExists = await this.brandsService.exists(
        updateProductDto.brandId,
      );

      if (!brandExists) {
        throw new NotFoundException('Brand not found');
      }
    }

    const updatedProduct = this.productRepository.merge(
      product,
      updateProductDto,
    );

    return this.productRepository.save(updatedProduct);
  }
}
