import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StorefrontConfigurationSection } from '../../enums';

export class SyncStorefrontConfigurationItemDto {
  @IsEnum(StorefrontConfigurationSection, {
    message: `type must be one of: ${Object.values(StorefrontConfigurationSection).join(', ')}`,
  })
  type: StorefrontConfigurationSection;

  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  @IsNotEmpty({ message: 'categoryId is required' })
  categoryId: string;

  @MaxLength(255, { message: 'title must be at most 255 characters' })
  @IsString({ message: 'title must be a string' })
  @IsOptional()
  title?: string;

  @MaxLength(100, { message: 'icon must be at most 100 characters' })
  @IsString({ message: 'icon must be a string' })
  @IsOptional()
  icon?: string;

  @Min(0, { message: 'displayOrder must be greater than or equal to 0' })
  @IsInt({ message: 'displayOrder must be an integer' })
  displayOrder: number;

  @IsBoolean({ message: 'enabled must be a boolean' })
  enabled: boolean;

  @IsBoolean({ message: 'isDeleted must be a boolean' })
  @IsOptional()
  isDeleted?: boolean;
}

export class SyncStorefrontConfigurationsDto {
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least 1 item need to be provided' })
  @IsArray({ message: 'items must be an array' })
  @Type(() => SyncStorefrontConfigurationItemDto)
  items: SyncStorefrontConfigurationItemDto[];
}
