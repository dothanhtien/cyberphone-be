import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { ProductSortEnum } from '../../enums';

export class FilterProductsDto extends PaginationQueryDto {
  @IsString({
    message: 'Search must be a string',
  })
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsString({
    message: 'Category ID must be a string',
  })
  categoryId?: string;

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
}
