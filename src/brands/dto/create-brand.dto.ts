import {
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateBrandDto {
  @MaxLength(255, { message: 'Brand name must not exceed 255 characters' })
  @IsString({ message: 'Brand name must be a string' })
  @IsNotEmpty({ message: 'Brand name is required' })
  name: string;

  @MaxLength(255, { message: 'Slug must not exceed 255 characters' })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @MaxLength(512, { message: 'Website URL must not exceed 512 characters' })
  @IsUrl({}, { message: 'Website URL must be a valid URL' })
  @IsOptional()
  websiteUrl?: string;

  @IsEmpty({ message: 'You cannot set logoUrl' })
  logoUrl?: string;

  @IsEmpty({ message: 'You cannot set createdBy' })
  createdBy?: string;
}
