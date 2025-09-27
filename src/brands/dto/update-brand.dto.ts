import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateBrandDto {
  @MaxLength(255, { message: 'Brand name must not exceed 255 characters' })
  @IsString({ message: 'Brand name must be a string' })
  @IsNotEmpty({ message: 'Brand name is required' })
  @IsOptional()
  name?: string;

  @MaxLength(255, { message: 'Slug must not exceed 255 characters' })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  @IsOptional()
  slug?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @MaxLength(512, { message: 'Website URL must not exceed 512 characters' })
  @IsUrl({}, { message: 'Website URL must be a valid URL' })
  @IsOptional()
  websiteUrl?: string;

  @MaxLength(512, { message: 'Logo URL must not exceed 512 characters' })
  @IsUrl({}, { message: 'Logo URL must be a valid URL' })
  @IsOptional()
  logoUrl?: string | null;

  @IsEmpty({ message: 'You cannot set isActive' })
  isActive?: boolean;

  @IsEmpty({ message: 'You cannot set updatedBy' })
  updatedBy?: string;

  @IsBoolean({ message: 'Remove logo must be a boolean' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  removeLogo?: boolean;
}
