import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Brand } from '@/brands/entities/brand.entity';
import { Category } from '@/categories/entities/category.entity';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { PaginatedEntity } from '@/common/interfaces/pagination.interface';
import { extractPaginationParams } from '@/common/utils/paginations.util';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    createProductDto.slug = createProductDto.slug.toLowerCase();
    const isSlugExist = await this.productRepository.existsBy({
      slug: createProductDto.slug,
      isActive: true,
    });
    if (isSlugExist) {
      throw new BadRequestException('Slug already exists');
    }

    const isBrandExist = await this.brandRepository.existsBy({
      id: createProductDto.brandId,
      isActive: true,
    });
    if (!isBrandExist) {
      throw new BadRequestException('Brand does not exist');
    }

    const isCategoryExist = await this.categoryRepository.existsBy({
      id: createProductDto.categoryId,
      isActive: true,
    });
    if (!isCategoryExist) {
      throw new BadRequestException('Category does not exist');
    }

    const newProduct = plainToInstance(Product, createProductDto, {
      excludeExtraneousValues: true,
    });

    return this.productRepository.save(newProduct);
  }

  async findAll(
    getProductsDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<Product>> {
    const { page, limit } = extractPaginationParams(getProductsDto);

    const [products, totalCount] = await this.productRepository.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: products,
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id })
      .andWhere('product.isActive = true')
      .select([
        'product',
        'brand.id',
        'brand.name',
        'category.id',
        'category.name',
      ])
      .getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.slug) {
      updateProductDto.slug = updateProductDto.slug.toLowerCase();
    }

    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const isSlugExist = await this.productRepository.existsBy({
        slug: updateProductDto.slug,
        isActive: true,
      });
      if (isSlugExist) {
        throw new BadRequestException('Slug already exists');
      }
    }

    if (updateProductDto.brandId) {
      const isBrandExist = await this.brandRepository.existsBy({
        id: updateProductDto.brandId,
        isActive: true,
      });
      if (!isBrandExist) {
        throw new BadRequestException('Brand does not exist');
      }
    }

    if (updateProductDto.categoryId) {
      const isCategoryExist = await this.categoryRepository.existsBy({
        id: updateProductDto.categoryId,
        isActive: true,
      });
      if (!isCategoryExist) {
        throw new BadRequestException('Category does not exist');
      }
    }

    const updateProduct = plainToInstance(
      Product,
      { ...product, ...updateProductDto },
      { excludeExtraneousValues: true },
    );

    return this.productRepository.save(updateProduct);
  }
}
