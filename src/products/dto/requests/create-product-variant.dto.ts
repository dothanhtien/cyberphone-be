import { ProductVariantStockStatus } from '@/common/enums';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  IsEmpty,
  Matches,
} from 'class-validator';

const MAX_NAME_LENGTH = 255;
const MAX_SKU_LENGTH = 100;

// decimal(12,2) — allow "1000", "1000.50"
const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

export class CreateProductVariantDto {
  @IsUUID('4', { message: 'productId must be a valid UUID' })
  @IsNotEmpty({ message: 'productId is required' })
  productId: string;

  @MaxLength(MAX_SKU_LENGTH, {
    message: `SKU must not exceed ${MAX_SKU_LENGTH} characters`,
  })
  @IsString({ message: 'SKU must be a string' })
  @IsNotEmpty({ message: 'SKU is required' })
  sku: string;

  @MaxLength(MAX_NAME_LENGTH, {
    message: `Variant name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Variant name must be a string' })
  @IsNotEmpty({ message: 'Variant name is required' })
  name: string;

  @Matches(DECIMAL_REGEX, {
    message: 'Price must be a valid decimal with up to 2 decimal places',
  })
  @IsString({ message: 'Price must be a string' })
  @IsNotEmpty({ message: 'Price is required' })
  price: string;

  @Matches(DECIMAL_REGEX, {
    message: 'Sale price must be a valid decimal with up to 2 decimal places',
  })
  @IsString({ message: 'Sale price must be a string' })
  @IsOptional()
  salePrice?: string;

  @Matches(DECIMAL_REGEX, {
    message: 'Cost price must be a valid decimal with up to 2 decimal places',
  })
  @IsString({ message: 'Cost price must be a string' })
  @IsOptional()
  costPrice?: string;

  @IsInt({ message: 'Stock quantity must be an integer' })
  @Min(0, { message: 'Stock quantity must be greater than or equal to 0' })
  @IsOptional()
  stockQuantity?: number;

  @IsEnum(ProductVariantStockStatus, {
    message: `Stock status must be one of: ${Object.values(
      ProductVariantStockStatus,
    ).join(', ')}`,
  })
  @IsOptional()
  stockStatus?: ProductVariantStockStatus;

  @IsInt({ message: 'Low stock threshold must be an integer' })
  @Min(0, {
    message: 'Low stock threshold must be greater than or equal to 0',
  })
  @IsOptional()
  lowStockThreshold?: number;

  @IsBoolean({ message: 'isDefault must be a boolean' })
  @IsOptional()
  isDefault?: boolean;

  @IsEmpty({ message: 'createdBy is not allowed to be set' })
  createdBy: string;
}
