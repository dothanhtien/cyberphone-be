import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto';
import { ProductSortEnum } from '../../enums';

export class FilterProductsDto extends PaginationQueryDto {
  @IsString({
    message: 'Search must be a string',
  })
  @IsOptional()
  search?: string;

  @IsEnum(ProductSortEnum, {
    message:
      'Sort must be one of the following values: newest, price_asc, price_desc',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  })
  @IsOptional()
  sort?: ProductSortEnum;

  @IsBoolean()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return value;
  })
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  categorySlug?: string;
}
