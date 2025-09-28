import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
  IsString,
  IsEmpty,
} from 'class-validator';

export class UpdateProductDto {
  @MaxLength(255, { message: 'Product name must not exceed 255 characters' })
  @IsNotEmpty({ message: 'Product name must not be empty' })
  @IsOptional()
  name?: string;

  @MaxLength(255, { message: 'Slug must not exceed 255 characters' })
  @IsNotEmpty({ message: 'Slug must not be empty' })
  @IsOptional()
  slug?: string;

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

  @IsUUID('4', { message: 'Brand ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Brand ID must not be empty' })
  @IsOptional()
  brandId?: string;

  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Category ID must not be empty' })
  @IsOptional()
  categoryId?: string;

  @IsEmpty({ message: 'You cannot set isActive' })
  isActive?: boolean;

  @IsEmpty({ message: 'You cannot set updatedBy' })
  updatedBy?: string;
}
