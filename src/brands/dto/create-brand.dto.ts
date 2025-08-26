import {
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateBrandDto {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @MaxLength(512)
  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @MaxLength(512)
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsEmpty()
  createdBy?: string;
}
