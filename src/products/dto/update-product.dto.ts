import {
  IsString,
  IsOptional,
  MaxLength,
  IsUUID,
  IsBoolean,
  IsEnum,
  IsEmpty,
} from 'class-validator';
import { ProductStatus } from '@/common/enums';

const MAX_NAME_LENGTH = 255;
const MAX_SLUG_LENGTH = 255;

export class UpdateProductDto {
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Product name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Product name must be a string' })
  @IsOptional()
  name?: string;

  @MaxLength(MAX_SLUG_LENGTH, {
    message: `Slug must not exceed ${MAX_SLUG_LENGTH} characters`,
  })
  @IsString({ message: 'Slug must be a string' })
  @IsOptional()
  slug?: string;

  @IsString({ message: 'Short description must be a string' })
  @IsOptional()
  shortDescription?: string;

  @IsString({ message: 'Long description must be a string' })
  @IsOptional()
  longDescription?: string;

  @IsEnum(ProductStatus, {
    message: `Status must be one of: ${Object.values(ProductStatus).join(', ')}`,
  })
  @IsOptional()
  status?: ProductStatus;

  @IsBoolean({ message: 'isFeatured must be a boolean' })
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean({ message: 'isBestseller must be a boolean' })
  @IsOptional()
  isBestseller?: boolean;

  @IsUUID('4', { message: 'brandId must be a valid UUID' })
  @IsOptional()
  brandId?: string;

  @IsEmpty({ message: 'isActive is not allowed to be set manually' })
  isActive: boolean;

  @IsEmpty({ message: 'updatedBy is not allowed to be set manually' })
  updatedBy: string;
}
