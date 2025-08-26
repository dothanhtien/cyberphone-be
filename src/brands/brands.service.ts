import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { plainToInstance } from 'class-transformer';
import { PaginatedBrands } from './interfaces';
import { GetBrandsDto } from './dto/get-brands.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const newBrand = plainToInstance(Brand, createBrandDto, {
      excludeExtraneousValues: true,
    });
    return this.brandRepository.save(newBrand);
  }

  async findAll(getBrandsDto: GetBrandsDto): Promise<PaginatedBrands> {
    const page = getBrandsDto.page || 1;
    const limit = getBrandsDto.limit || 10;

    const [brands, totalCount] = await this.brandRepository.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: brands,
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id, isActive: true },
    });
    if (!brand) throw new NotFoundException(`Brand not found`);
    return brand;
  }
}
