import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const MAX_NAME_LENGTH = 255;
const MAX_SKU_LENGTH = 100;

export class CreateProductVariantDto {
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

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a number with up to 2 decimal places' },
  )
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  @Type(() => Number)
  price: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Sale price must be a number with up to 2 decimal places' },
  )
  @Min(0, { message: 'Sale price must be greater than or equal to 0' })
  @Type(() => Number)
  @IsOptional()
  salePrice?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Cost price must be a number with up to 2 decimal places' },
  )
  @Min(0, { message: 'Cost price must be greater than or equal to 0' })
  @Type(() => Number)
  @IsOptional()
  costPrice?: number;

  @IsInt({ message: 'Stock quantity must be an integer' })
  @Min(0, { message: 'Stock quantity must be greater than or equal to 0' })
  @IsOptional()
  stockQuantity?: number;

  @IsInt({ message: 'Low stock threshold must be an integer' })
  @Min(0, {
    message: 'Low stock threshold must be greater than or equal to 0',
  })
  @IsOptional()
  lowStockThreshold?: number;

  @IsBoolean({ message: 'isDefault must be a boolean' })
  @IsOptional()
  isDefault?: boolean;

  @IsEmpty()
  createdBy: string;
}
