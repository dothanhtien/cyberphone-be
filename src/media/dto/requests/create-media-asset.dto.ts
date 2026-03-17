import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsEmpty,
} from 'class-validator';
import { MediaAssetResourceType } from '@/common/enums';

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
  resourceType: MediaAssetResourceType;

  @IsNotEmpty({ message: 'Ref type is required' })
  @IsString({ message: 'Ref type must be a string' })
  refType: string;

  @IsNotEmpty({ message: 'Ref Id is required' })
  @IsString({ message: 'Ref Id must be a string' })
  refId: string;

  @IsNotEmpty({ message: 'Usage type is required' })
  @IsString({ message: 'Usage type must be a string' })
  usageType: string;

  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, unknown>;

  @IsEmpty()
  createdBy: string;
}
