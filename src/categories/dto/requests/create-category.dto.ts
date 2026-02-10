import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

const MAX_NAME_LENGTH = 255;
const MAX_SLUG_LENGTH = 255;

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    maxLength: MAX_NAME_LENGTH,
    example: 'Electronics',
  })
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Category name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug of the category',
    maxLength: MAX_SLUG_LENGTH,
    example: 'electronics',
  })
  @MaxLength(MAX_SLUG_LENGTH, {
    message: `Slug must not exceed ${MAX_SLUG_LENGTH} characters`,
  })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @ApiPropertyOptional({
    description: 'Parent category ID (UUID v4)',
    format: 'uuid',
    example: 'b7c1c1a2-9a7d-4a9c-b9a0-6b8f6b4f1c2e',
  })
  @IsUUID('4', { message: 'Parent ID must be a valid UUID (v4)' })
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'All electronic devices and accessories',
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsEmpty()
  createdBy?: string;
}

export class CreateCategoryWithLogoDto extends CreateCategoryDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  logo?: any;
}
