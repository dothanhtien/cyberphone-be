import {
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateBrandDto {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  slug?: string;

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

  @IsEmpty({ message: 'You cannot set isActive' })
  isActive?: boolean;

  @IsEmpty({ message: 'You cannot set updatedBy' })
  updatedBy?: string;
}
