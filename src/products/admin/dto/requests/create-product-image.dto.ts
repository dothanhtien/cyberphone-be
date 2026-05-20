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
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductImageType } from '@/common/enums';
import { toOptionalBoolean } from '@/common/utils';

const MAX_TITLE_LENGTH = 255;
const MAX_ALT_TEXT_LENGTH = 255;

export class CreateProductImageDto {
  @IsUUID('4', { message: 'id must be a valid UUID' })
  @IsNotEmpty({ message: 'id is required' })
  id: string;

  @IsEnum(ProductImageType, {
    message: `imageType must be one of: ${Object.values(ProductImageType).join(', ')}`,
  })
  @IsString({ message: 'imageType must be a string' })
  @IsNotEmpty({ message: 'imageType is required' })
  imageType: ProductImageType;

  @MaxLength(MAX_ALT_TEXT_LENGTH, {
    message: `altText must not exceed ${MAX_ALT_TEXT_LENGTH} characters`,
  })
  @IsString({ message: 'altText must be a string' })
  @IsOptional()
  altText?: string | null;

  @MaxLength(MAX_TITLE_LENGTH, {
    message: `title must not exceed ${MAX_TITLE_LENGTH} characters`,
  })
  @IsString({ message: 'title must be a string' })
  @IsOptional()
  title?: string | null;

  @IsInt({ message: 'displayOrder must be an integer' })
  @Min(0, { message: 'displayOrder must be greater than or equal to 0' })
  @IsOptional()
  displayOrder?: number;

  @IsBoolean({ message: 'isDeleted must be a boolean' })
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsOptional()
  isDeleted?: boolean;

  @IsEmpty()
  createdBy: string;
}
