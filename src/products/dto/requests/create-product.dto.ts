import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  IsBoolean,
  IsEnum,
  ArrayUnique,
  ArrayNotEmpty,
  IsArray,
  IsEmpty,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductStatus } from '@/common/enums';
import { CreateProductImageDto } from './create-product-image.dto';
import { safeJsonParse } from '@/common/utils/parsers';

const MAX_NAME_LENGTH = 255;
const MAX_SLUG_LENGTH = 255;

export class CreateProductDto {
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Product name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @MaxLength(MAX_SLUG_LENGTH, {
    message: `Slug must not exceed ${MAX_SLUG_LENGTH} characters`,
  })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @IsString({ message: 'Short description must be a string' })
  @IsOptional()
  shortDescription?: string;

  @IsString({ message: 'Long description must be a string' })
  @IsOptional()
  longDescription?: string;

  @IsEnum(ProductStatus, {
    message: `Status must be one of: ${Object.values(ProductStatus).join(', ')}`,
  })
  @IsString({ message: 'Status must be a string' })
  @IsNotEmpty({ message: 'Status is required' })
  status: ProductStatus;

  @IsBoolean({ message: 'isFeatured must be a boolean' })
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean({ message: 'isBestseller must be a boolean' })
  @IsOptional()
  isBestseller?: boolean;

  @IsUUID('4', { message: 'brandId must be a valid UUID' })
  @IsNotEmpty({ message: 'brandId is required' })
  brandId: string;

  @Transform(({ value }) => {
    let result: unknown;

    if (typeof value === 'string') {
      result = safeJsonParse<CreateProductImageDto[]>(value);
    } else {
      result = value;
    }

    return result;
  })
  @ArrayUnique({ message: 'categoryIds must not contain duplicates' })
  @IsUUID('4', {
    each: true,
    message: 'Each categoryId must be a valid UUID',
  })
  @ArrayNotEmpty({ message: 'categoryIds must not be empty' })
  @IsArray({ message: 'categoryIds must be an array' })
  categoryIds: string[];

  @Transform(({ value }) => {
    let result: unknown;

    if (typeof value === 'string') {
      result = safeJsonParse<CreateProductImageDto[]>(value);
    } else {
      result = value;
    }

    return result;
  })
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  @IsArray({ message: 'images must be an array' })
  @IsOptional()
  images: CreateProductImageDto[];

  @IsEmpty()
  createdBy: string;
}
