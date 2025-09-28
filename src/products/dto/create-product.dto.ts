import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
  IsString,
  IsEmpty,
} from 'class-validator';

export class CreateProductDto {
  @MaxLength(255, { message: 'Product name must not exceed 255 characters' })
  @IsNotEmpty({ message: 'Product name must not be empty' })
  name: string;

  @MaxLength(255, { message: 'Slug must not exceed 255 characters' })
  @IsNotEmpty({ message: 'Slug must not be empty' })
  slug: string;

  @MaxLength(500, {
    message: 'Short description must not exceed 500 characters',
  })
  @IsOptional()
  shortDescription?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsBoolean({ message: 'isFeatured must be a boolean value' })
  @IsOptional()
  isFeatured?: boolean;

  @MaxLength(255, { message: 'Meta title must not exceed 255 characters' })
  @IsOptional()
  metaTitle?: string;

  @MaxLength(500, {
    message: 'Meta description must not exceed 500 characters',
  })
  @IsOptional()
  metaDescription?: string;

  @IsUUID('4', { message: 'Brand ID must be a valid UUID (v4)' })
  @IsNotEmpty({ message: 'Brand ID must not be empty' })
  brandId: string;

  @IsUUID('4', { message: 'Category ID must be a valid UUID (v4)' })
  @IsNotEmpty({ message: 'Category ID must not be empty' })
  categoryId: string;

  @IsBoolean({ message: 'isActive must be a boolean value' })
  @IsOptional()
  isActive?: boolean;

  @IsEmpty({ message: 'You cannot set createdBy manually' })
  createdBy?: string;
}
