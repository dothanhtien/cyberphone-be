import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { GetBrandsDto } from './dto/get-brands.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginatedEntity } from 'src/interfaces';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const slug = createBrandDto.slug.toLowerCase();

    const brand = await this.brandRepository.findOne({
      where: { slug },
      select: { isActive: true },
    });

    if (brand && brand.isActive) {
      throw new BadRequestException('Slug already exists');
    }
    // in case a brand is inactive, add the property isActive = true
    // if it is null, it can still be assigned to the object without error

    const newBrand = plainToInstance(
      Brand,
      { ...brand, isActive: true, ...createBrandDto },
      {
        excludeExtraneousValues: true,
      },
    );

    return this.brandRepository.save(newBrand);
  }

  async findAll(getBrandsDto: GetBrandsDto): Promise<PaginatedEntity<Brand>> {
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

    if (!brand) {
      throw new NotFoundException(`Brand not found`);
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand not found`);
    }

    if (updateBrandDto.slug) {
      updateBrandDto.slug = updateBrandDto.slug.toLowerCase();

      if (updateBrandDto.slug !== brand.slug) {
        const exists = await this.brandRepository.existsBy({
          slug: updateBrandDto.slug,
        });

        if (exists) {
          throw new BadRequestException('Slug already exists');
        }
      }
    }

    const updates = Object.fromEntries(
      Object.entries(updateBrandDto).filter(([, value]) => value !== undefined),
    );

    Object.assign(brand, updates);

    const dataToUpdate = plainToInstance(Brand, brand, {
      excludeExtraneousValues: true,
    });

    return this.brandRepository.save(dataToUpdate);
  }
}
