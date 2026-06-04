import { Expose, Type } from 'class-transformer';
import { ProductAttributeResponseDto } from './product-attribute-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';
import { BrandResponseDto } from '@/brands/dto';
import { CategoryResponseDto } from '@/categories/dto';

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
  brand: Pick<BrandResponseDto, 'id' | 'name'>;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: string;

  @Expose()
  createdBy: string;

  @Expose()
  updatedAt: string | null;

  @Expose()
  updatedBy: string | null;

  @Expose()
  @Type(() => CategoryResponseDto)
  categories: Pick<CategoryResponseDto, 'id' | 'name'>[];

  @Expose()
  @Type(() => ProductImageResponseDto)
  images: ProductImageResponseDto[];

  @Expose()
  @Type(() => ProductAttributeResponseDto)
  attributes: ProductAttributeResponseDto[] | undefined;

  @Expose()
  variantCount?: number;
}
