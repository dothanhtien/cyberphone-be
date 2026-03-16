import { IsEmpty, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';

export class UploadMediasDto {
  @IsUUID('4', { message: 'Ref Id must be a valid UUID (v4)' })
  refId: string;

  @IsEnum(MediaAssetRefType, {
    message: `Type must be one of: ${Object.values(MediaAssetRefType).join(', ')}`,
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

  @IsEmpty()
  createdBy: string;
}
