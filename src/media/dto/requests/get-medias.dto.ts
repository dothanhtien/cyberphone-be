import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { MediaAssetRefType } from '@/common/enums';

export class GetMediasDto {
  @IsUUID('4', { message: 'Ref Id must be a valid UUID (v4)' })
  refId: string;

  @IsEnum(MediaAssetRefType, {
    message: `Type must be one of: ${Object.values(MediaAssetRefType).join(', ')}`,
  })
  @IsString({ message: 'Ref type must be a string' })
  @IsNotEmpty({ message: 'Ref type is required' })
  refType: MediaAssetRefType;
}
