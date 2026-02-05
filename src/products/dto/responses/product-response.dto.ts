import { Expose, Type } from 'class-transformer';
import { BrandResponseDto } from '@/brands/dto/responses/brand-response.dto';
import { CategoryResponseDto } from '@/categories/dto/responses/category-response.dto';

export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  shortDescription: string | null;

  @Expose()
  longDescription: string | null;

  @Expose()
  status: string;

  @Expose()
  isFeatured: boolean;

  @Expose()
  isBestseller: boolean;

  @Expose()
  @Type(() => BrandResponseDto)
  brand: BrandResponseDto;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  createdBy: string;

  @Expose()
  updatedAt: Date;

  @Expose()
  updatedBy: string | null;

  @Expose()
  @Type(() => CategoryResponseDto)
  categories: CategoryResponseDto[];
}
