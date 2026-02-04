import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { toEntity } from '@/common/utils/entities';
import { normalizeSlug } from '@/common/utils/slugs';
import { BrandsService } from '@/brands/brands.service';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { PaginatedEntity } from '@/common/types/paginations.type';
import {
  buildPaginationParams,
  extractPaginationParams,
} from '@/common/utils/paginations.util';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly brandsService: BrandsService,
  ) {}

  async create(createProductDto: CreateProductDto) {
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

    const product = toEntity(Product, createProductDto);
    return this.productRepository.save(product);
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
