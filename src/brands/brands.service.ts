import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { PaginatedEntity } from '@/common/interfaces/pagination.interface';
import { extractPaginationParams } from '@/common/utils/paginations.util';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    createBrandDto.slug = createBrandDto.slug.toLowerCase();

    const brand = await this.brandRepository.findOne({
      where: { slug: createBrandDto.slug, isActive: true },
    });

    if (brand) {
      throw new BadRequestException('Slug already exists');
    }

    const newBrand = plainToInstance(Brand, createBrandDto, {
      excludeExtraneousValues: true,
    });

    return this.brandRepository.save(newBrand);
  }

  async findAll(
    getBrandsDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<Brand>> {
    const { page, limit } = extractPaginationParams(getBrandsDto);

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

    if (!brand) {
      throw new NotFoundException(`Brand not found`);
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findOne({
      where: { id, isActive: true },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (updateBrandDto.slug) {
      updateBrandDto.slug = updateBrandDto.slug.toLowerCase();
    }

    if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      const existingBrand = await this.brandRepository.findOne({
        where: { slug: updateBrandDto.slug, isActive: true },
        select: ['id'],
      });

      if (existingBrand && existingBrand.id !== id) {
        throw new BadRequestException('Slug already exists');
      }
    }

    if (updateBrandDto.removeLogo) {
      updateBrandDto.logoUrl = null;
    } else if (updateBrandDto.logoUrl === undefined) {
      updateBrandDto.logoUrl = brand.getLogoPath();
    }

    const updatedBrand = plainToInstance(
      Brand,
      { ...brand, ...updateBrandDto },
      { excludeExtraneousValues: true },
    );

    return this.brandRepository.save(updatedBrand);
  }

  async getLogoPath(id: string): Promise<string | null> {
    const brand = await this.brandRepository.findOne({
      where: { id, isActive: true },
    });
    return brand?.getLogoPath() ?? null;
  }
}
