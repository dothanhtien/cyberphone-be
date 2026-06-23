import {
  ProductVariantListResponseDto,
  ProductVariantResponseDto,
} from '../dto';
import {
  ProductVariantBaseRaw,
  ProductVariantListRaw,
  ProductVariantRaw,
} from '../types';
import { toDto } from '@/common/utils';

function mapBaseVariantFields(variant: ProductVariantBaseRaw) {
  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    name: variant.name,
    price: Number(variant.price),
    salePrice: variant.salePrice !== null ? Number(variant.salePrice) : null,
    costPrice: variant.costPrice !== null ? Number(variant.costPrice) : null,
    stockQuantity: variant.stockQuantity,
    stockStatus: variant.stockStatus,
    lowStockThreshold: variant.lowStockThreshold,
    isDefault: variant.isDefault,
    isActive: variant.isActive,
    createdAt: variant.createdAt,
    createdBy: variant.createdBy,
    updatedAt: variant.updatedAt,
    updatedBy: variant.updatedBy,
  };
}

export function mapToProductVariantResponse(
  variant: ProductVariantRaw,
): ProductVariantResponseDto {
  return toDto(ProductVariantResponseDto, {
    ...mapBaseVariantFields(variant),
    attributes: variant.attributes.map((attr) => ({
      id: attr.id,
      productAttributeId: attr.productAttributeId,
      attributeValue: attr.attributeValue,
      attributeValueDisplay: attr.attributeValueDisplay,
    })),
    images: variant.images.map((img) => ({
      id: img.id,
      imageType: img.imageType,
      displayOrder: img.displayOrder,
      altText: img.altText,
      url: img.url,
    })),
  });
}

export function mapToProductVariantListResponse(
  variant: ProductVariantListRaw,
): ProductVariantListResponseDto {
  return toDto(ProductVariantListResponseDto, {
    ...mapBaseVariantFields(variant),
    mainImageUrl: variant.mainImageUrl,
  });
}
