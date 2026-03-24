import { MediaAssetUsageType, ProductImageType } from '@/common/enums';

export const PRODUCT_IMAGE_TYPE_TO_MEDIA_USAGE: Record<
  ProductImageType,
  MediaAssetUsageType
> = {
  [ProductImageType.MAIN]: MediaAssetUsageType.MAIN,
  [ProductImageType.THUMBNAIL]: MediaAssetUsageType.THUMBNAIL,
  [ProductImageType.GALLERY]: MediaAssetUsageType.GALLERY,
};

export function mapProductImageTypeToMediaUsage(
  type: ProductImageType,
): MediaAssetUsageType {
  return (
    (type && PRODUCT_IMAGE_TYPE_TO_MEDIA_USAGE[type]) ??
    MediaAssetUsageType.OTHER
  );
}
