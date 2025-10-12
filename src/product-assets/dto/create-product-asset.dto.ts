import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ImageTypes } from '../entities/product-assets.entity';

export class CreateProductAssetDto {
  @IsUUID('4', { message: 'File ID must be a valid UUID' })
  @IsNotEmpty({ message: 'File ID must not be empty' })
  fileId: string;

  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Product ID must not be empty' })
  productId: string;

  @IsUUID('4', { message: 'Variant ID must be a valid UUID' })
  @IsOptional()
  variantId: string;

  @IsEnum(ImageTypes)
  type: ImageTypes = ImageTypes.GALLERY;

  @MaxLength(255, { message: 'Alt text must not exceed 255 characters' })
  @IsString({ message: 'Alt text must be a string' })
  @IsOptional()
  altText?: string;

  @IsInt({ message: 'Sort order must be an integer' })
  @IsOptional()
  sortOrder?: number = 0;

  @IsBoolean({ message: 'isActive must be a boolean value' })
  @IsOptional()
  isActive?: boolean;

  @IsEmpty({ message: 'You cannot set createdBy manually' })
  createdBy?: string;

  @IsEmpty({ message: 'You cannot set logoUrl' })
  url?: string;
}
