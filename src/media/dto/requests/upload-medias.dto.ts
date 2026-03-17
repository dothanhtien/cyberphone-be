import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';
import { Transform } from 'class-transformer';

export class UploadMediasDto {
  @IsUUID('4', { message: 'Ref Id must be a valid UUID (v4)' })
  refId: string;

  @IsEnum(MediaAssetRefType, {
    message: `Ref type must be one of: ${Object.values(MediaAssetRefType).join(', ')}`,
  })
  @IsString({ message: 'Ref type must be a string' })
  @IsNotEmpty({ message: 'Ref type is required' })
  refType: MediaAssetRefType;

  @IsEnum(MediaAssetUsageType, {
    message: `Usage type must be one of: ${Object.values(MediaAssetUsageType).join(', ')}`,
  })
  @IsString({ message: 'Usage type must be a string' })
  @IsNotEmpty({ message: 'Usage type is required' })
  usageType: MediaAssetUsageType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
  })
  @IsBoolean({ message: 'Is temporary must be a boolean' })
  isTemporary = false;

  @IsEmpty()
  createdBy: string;
}
