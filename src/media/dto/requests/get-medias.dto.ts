import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MediaAssetRefType } from '@/common/enums';

export class GetMediasDto {
  @IsUUID('4', { message: 'Ref Id must be a valid UUID (v4)' })
  refId: string;

  @IsEnum(MediaAssetRefType, {
    message: `Ref type must be one of: ${Object.values(MediaAssetRefType).join(', ')}`,
  })
  @IsString({ message: 'Ref type must be a string' })
  @IsNotEmpty({ message: 'Ref type is required' })
  refType: MediaAssetRefType;

  @IsBoolean({ message: 'Is temporary must be a boolean' })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsOptional()
  isTemporary = false;
}
