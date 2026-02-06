import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsEmpty,
} from 'class-validator';
import { MediaType } from '../entities/media-asset.entity';

export class CreateMediaAssetDto {
  @IsNotEmpty({ message: 'publicId is required' })
  @IsString({ message: 'publicId must be a string' })
  publicId: string;

  @IsNotEmpty({ message: 'url is required' })
  @IsString({ message: 'url must be a string' })
  url: string;

  @IsEnum(MediaType, { message: 'resourceType must be a valid MediaType' })
  resourceType: MediaType;

  @IsNotEmpty({ message: 'refType is required' })
  @IsString({ message: 'refType must be a string' })
  refType: string;

  @IsNotEmpty({ message: 'refId is required' })
  @IsString({ message: 'refId must be a string' })
  refId: string;

  @IsOptional()
  @IsObject({ message: 'metadata must be an object' })
  metadata?: Record<string, any>;

  @IsEmpty({ message: 'createdBy is not allowed to be set manually' })
  createdBy: string;
}
