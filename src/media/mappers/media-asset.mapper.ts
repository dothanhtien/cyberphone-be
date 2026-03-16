import { toDto } from '@/common/utils';
import { MediaAssetResponse } from '../dto';
import { MediaAsset } from '../entities';

export function mapToMediaAssetResponse(input: MediaAsset): MediaAssetResponse {
  return toDto(MediaAssetResponse, {
    id: input.id,
    url: input.url,
    refType: input.refType,
    refId: input.refId,
    usageType: input.usageType,
    metaData: input.metadata ? input.metadata : undefined,
  });
}
