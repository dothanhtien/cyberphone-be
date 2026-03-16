import { Expose } from 'class-transformer';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';

export class MediaAssetResponse {
  @Expose()
  id: string;

  @Expose()
  url: string;

  @Expose()
  refType: MediaAssetRefType;

  @Expose()
  refId: string;

  @Expose()
  usageType: MediaAssetUsageType;

  @Expose()
  metaData?: string | null;
}
