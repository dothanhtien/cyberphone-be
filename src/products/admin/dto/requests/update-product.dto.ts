import {
  IsString,
  IsOptional,
  MaxLength,
  IsUUID,
  IsBoolean,
  IsEnum,
  IsEmpty,
  ArrayUnique,
  ArrayNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';
import { ProductStatus } from '@/common/enums';
import { normalizeSlug, safeJsonParse } from '@/common/utils';
import { ArrayUniqueBy } from '@/common/validators/array-unique-by.decorator';
import { CreateProductAttributeDto } from '.';

const MAX_NAME_LENGTH = 255;
const MAX_SLUG_LENGTH = 255;

export class UpdateProductDto {
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Product name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Product name must be a string' })
  @IsOptional()
  name?: string;

  @Transform(({ value }: { value: string }) => normalizeSlug(value))
  @MaxLength(MAX_SLUG_LENGTH, {
    message: `Slug must not exceed ${MAX_SLUG_LENGTH} characters`,
  })
  @IsString({ message: 'Slug must be a string' })
  @IsOptional()
  slug?: string;

  @IsString({ message: 'Short description must be a string' })
  @IsOptional()
  shortDescription?: string;

  @IsString({ message: 'Long description must be a string' })
  @IsOptional()
  longDescription?: string;

  @IsEnum(ProductStatus, {
    message: `Status must be one of: ${Object.values(ProductStatus).join(', ')}`,
  })
  @IsOptional()
  status?: ProductStatus;

  @IsBoolean({ message: 'isFeatured must be a boolean' })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean({ message: 'isBestseller must be a boolean' })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  isBestseller?: boolean;

  @IsUUID('4', { message: 'brandId must be a valid UUID' })
  @IsOptional()
  brandId?: string;

  @ArrayUnique({ message: 'categoryIds must not contain duplicates' })
  @IsUUID('4', {
    each: true,
    message: 'Each categoryId must be a valid UUID',
  })
  @ArrayNotEmpty({ message: 'categoryIds must not be empty' })
  @IsArray({ message: 'categoryIds must be an array' })
  @Transform(({ value }) => {
    let result: unknown;

    if (typeof value === 'string') {
      result = safeJsonParse<string[]>(value);
    } else {
      result = value;
    }

    return result;
  })
  @IsOptional()
  categoryIds?: string[];

  @ValidateNested({ each: true })
  @IsArray({ message: 'Attributes must be an array' })
  @ArrayUniqueBy<CreateProductAttributeDto>('attributeKey', {
    message: 'Attribute key must not be duplicated',
  })
  @ArrayUniqueBy<CreateProductAttributeDto>('displayOrder', {
    message: 'Display order must not be duplicated',
  })
  @Transform(({ value }) => {
    let parsed: unknown = value;

    if (typeof value === 'string') {
      parsed = safeJsonParse<unknown>(value);
    }

    if (!Array.isArray(parsed)) {
      return parsed;
    }

    return parsed.map((item) =>
      plainToInstance(CreateProductAttributeDto, item),
    );
  })
  @IsOptional()
  attributes?: CreateProductAttributeDto[];

  @IsEmpty()
  isActive: boolean;

  @IsEmpty()
  updatedBy: string;
}
