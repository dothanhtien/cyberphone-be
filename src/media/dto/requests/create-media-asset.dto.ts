import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsEmpty,
} from 'class-validator';
import {
  MediaAssetRefType,
  MediaAssetResourceType,
  MediaAssetUsageType,
} from '@/common/enums';

export class CreateMediaAssetDto {
  @IsNotEmpty({ message: 'Public Id is required' })
  @IsString({ message: 'Public Id must be a string' })
  publicId: string;

  @IsNotEmpty({ message: 'Url is required' })
  @IsString({ message: 'Url must be a string' })
  url: string;

  @IsEnum(MediaAssetResourceType, {
    message: `Resource type must be one of: ${Object.values(MediaAssetResourceType).join(', ')}`,
  })
  @IsString({ message: 'Resource type must be a string' })
  @IsNotEmpty({ message: 'Resource type is required' })
  resourceType: MediaAssetResourceType;

  @IsEnum(MediaAssetRefType, {
    message: `Ref type must be one of: ${Object.values(MediaAssetRefType).join(', ')}`,
  })
  @IsString({ message: 'Ref type must be a string' })
  @IsNotEmpty({ message: 'Ref type is required' })
  refType: MediaAssetRefType;

  @IsNotEmpty({ message: 'Ref Id is required' })
  @IsString({ message: 'Ref Id must be a string' })
  refId: string;

  @IsEnum(MediaAssetUsageType, {
    message: `Usage type must be one of: ${Object.values(MediaAssetUsageType).join(', ')}`,
  })
  @IsString({ message: 'Usage type must be a string' })
  @IsNotEmpty({ message: 'Usage type is required' })
  usageType: MediaAssetUsageType;

  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, unknown>;

  @IsEmpty()
  createdBy: string;
}
