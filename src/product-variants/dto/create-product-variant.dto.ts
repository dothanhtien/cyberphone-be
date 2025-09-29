import { IsLessThan } from '@/common/decorators/is-less-than.decorator';
import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
  IsString,
  IsNumber,
  IsInt,
  Min,
  IsEmpty,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Product ID must not be empty' })
  productId: string;

  @MaxLength(100, { message: 'SKU must not exceed 100 characters' })
  @IsString({ message: 'SKU must be a string' })
  @IsNotEmpty({ message: 'SKU must not be empty' })
  sku: string;

  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @MaxLength(255, { message: 'Slug must not exceed 255 characters' })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug must not be empty' })
  slug: string;

  @Min(0, { message: 'Base price must be greater than or equal to 0' })
  @IsNumber({}, { message: 'Base price must be a number' })
  @IsNotEmpty({ message: 'Base price must not be empty' })
  basePrice: number;

  @IsLessThan('basePrice', {
    message: 'Sale price must be less than base price',
  })
  @Min(0, { message: 'Sale price must be greater than or equal to 0' })
  @IsNumber({}, { message: 'Sale price must be a number' })
  @IsOptional()
  salePrice?: number;

  @Min(0, { message: 'Cost price must be greater than or equal to 0' })
  @IsNumber({}, { message: 'Cost price must be a number' })
  @IsOptional()
  costPrice?: number;

  @Min(0, { message: 'Weight (kg) must be greater than or equal to 0' })
  @IsNumber({}, { message: 'Weight (kg) must be a number' })
  @IsOptional()
  weightKg?: number;

  @Min(0, { message: 'Stock quantity must be greater than or equal to 0' })
  @IsInt({ message: 'Stock quantity must be an integer' })
  @IsOptional()
  stockQuantity?: number;

  @Min(0, {
    message: 'Low stock threshold must be greater than or equal to 0',
  })
  @IsInt({ message: 'Low stock threshold must be an integer' })
  @IsOptional()
  lowStockThreshold?: number;

  @IsBoolean({ message: 'isActive must be a boolean value' })
  @IsOptional()
  isActive?: boolean;

  @IsEmpty({ message: 'You cannot set createdBy manually' })
  createdBy?: string;
}
