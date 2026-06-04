import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { safeJsonParse, toOptionalBoolean } from '@/common/utils';

export class SyncStorefrontSliderItemDto {
  @IsUUID('4', { message: 'id must be a valid UUID' })
  @IsNotEmpty({ message: 'id is required' })
  id: string;

  @MaxLength(255, { message: 'title must not exceed 255 characters' })
  @IsString({ message: 'title must be a string' })
  @IsOptional()
  title?: string;

  @MaxLength(255, {
    message: 'altText must not exceed 255 characters',
  })
  @IsString({ message: 'altText must be a string' })
  @IsOptional()
  altText?: string | null;

  @MaxLength(100, { message: 'icon must not exceed 100 characters' })
  @IsString({ message: 'icon must be a string' })
  @IsOptional()
  icon?: string | null;

  @Min(0, { message: 'displayOrder must be greater than or equal to 0' })
  @IsInt({ message: 'displayOrder must be an integer' })
  @Type(() => Number)
  @IsOptional()
  displayOrder?: number;

  @IsBoolean({ message: 'isDeleted must be a boolean' })
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsOptional()
  isDeleted?: boolean;

  @IsBoolean({ message: 'isDeactivated must be a boolean' })
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsOptional()
  isDeactivated?: boolean;
}

export class SyncStorefrontSlidersDto {
  @ValidateNested({ each: true })
  @ArrayNotEmpty({ message: 'items must not be empty' })
  @IsArray({ message: 'items must be an array' })
  @Transform(({ value }) => {
    let parsed: unknown = value;

    if (typeof value === 'string') {
      parsed = safeJsonParse<unknown>(value);
    }

    if (!Array.isArray(parsed)) {
      return parsed;
    }

    return parsed.map((item) =>
      plainToInstance(SyncStorefrontSliderItemDto, item),
    );
  })
  items: SyncStorefrontSliderItemDto[];
}
