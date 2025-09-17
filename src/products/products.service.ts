import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginatedEntity } from 'src/common/interfaces';
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
    const slug = createProductDto.slug.toLowerCase();
    const product = await this.productRepository.findOne({
      where: { slug },
    });

    if (product && product.isActive) {
      throw new BadRequestException('Slug already exists');
    }

    if (createProductDto.brandId) {
      const isBrandExist = await this.brandRepository.exists({
        where: { id: createProductDto.brandId, isActive: true },
      });

      if (!isBrandExist) {
        throw new BadRequestException('Brand does not exist');
      }
    }

    if (createProductDto.categoryId) {
      const isCategoryExist = await this.categoryRepository.exists({
        where: { id: createProductDto.categoryId, isActive: true },
      });

      if (!isCategoryExist) {
        throw new BadRequestException('Category does not exist');
      }
    }

    const newProduct = plainToInstance(Product, {
      ...product,
      ...createProductDto,
      slug,
      isActive: true,
    });

    return this.productRepository.save(newProduct);
  }

  async findAll(
    getProductsDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<Product>> {
    const page = getProductsDto.page || 1;
    const limit = getProductsDto.limit || 10;

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
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');
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
      const existing = await this.productRepository.findOne({
        where: { slug: updateProductDto.slug },
        select: ['id', 'isActive'],
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          existing.isActive
            ? 'Slug already exists'
            : 'Slug already exists in an inactive product',
        );
      }
    }

    const updateProduct = plainToInstance(
      Product,
      { ...product, isActive: true, ...updateProductDto },
      { excludeExtraneousValues: true },
    );

    return this.productRepository.save(updateProduct);
  }
}
