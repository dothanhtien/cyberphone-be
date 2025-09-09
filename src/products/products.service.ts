import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';

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
}
