import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  Matches,
  IsEmpty,
} from 'class-validator';

const MAX_NAME_LENGTH = 255;
const MAX_SLUG_LENGTH = 255;

export class UpdateBrandDto {
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Brand name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Brand name must be a string' })
  @IsOptional()
  name?: string;

  @MaxLength(MAX_SLUG_LENGTH, {
    message: `Slug must not exceed ${MAX_SLUG_LENGTH} characters`,
  })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must contain only lowercase letters, numbers, and hyphens. It must not start or end with a hyphen.',
  })
  @IsString({ message: 'Slug must be a string' })
  @IsOptional()
  slug?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    },
    {
      message:
        'Website URL must be a valid URL with http:// or https:// protocol',
    },
  )
  @MaxLength(2048, {
    message: 'Website URL must be at most 2048 characters',
  })
  @IsString({ message: 'Website URL must be a string' })
  @IsOptional()
  websiteUrl?: string;

  @IsEmpty({ message: 'isActive is not allowed to be set manually' })
  isActive?: boolean;

  @IsEmpty({ message: 'updatedBy is not allowed to be set manually' })
  updatedBy: string;
}
