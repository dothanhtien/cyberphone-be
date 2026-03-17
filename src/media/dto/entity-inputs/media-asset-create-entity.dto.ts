import { Expose } from 'class-transformer';
import {
  MediaAssetRefType,
  MediaAssetResourceType,
  MediaAssetUsageType,
} from '@/common/enums';

export class MediaAssetCreateEntityDto {
  @Expose()
  publicId: string;

  @Expose()
  url: string;

  @Expose()
  resourceType: MediaAssetResourceType;

  @Expose()
  refType: MediaAssetRefType;

  @Expose()
  refId: string;

  @Expose()
  usageType: MediaAssetUsageType;

  @Expose()
  metadata?: Record<string, unknown>;

  @Expose()
  createdBy: string;
}
