import {
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @MaxLength(255, { message: 'Category name must not exceed 255 characters' })
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  @MaxLength(255, { message: 'Slug must not exceed 255 characters' })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @IsUUID('4', { message: 'Parent ID must be a valid UUID (v4)' })
  @IsOptional()
  parentId?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'Logo URL must be a valid URL' })
  @MaxLength(512, { message: 'Logo URL must not exceed 512 characters' })
  @IsOptional()
  logoUrl?: string;

  @IsEmpty({ message: 'You cannot set createdBy' })
  createdBy?: string;
}
