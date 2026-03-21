import { ProductResponseDto } from '../dto';
import { ProductRaw } from '../types';
import { toDto } from '@/common/utils';

export function mapToProductResponseFromProductRaw(
  product: ProductRaw,
): ProductResponseDto {
  return toDto(ProductResponseDto, {
    id: product.id,
    name: product.name,
    slug: product.slug,
    status: product.status,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    isFeatured: product.isFeatured,
    isBestseller: product.isBestseller,
    brand: product.brand,
    isActive: product.isActive,
    createdAt: product.createdAt,
    createdBy: product.createdBy,
    updatedAt: product.updatedAt,
    updatedBy: product.updatedBy ?? null,

    categories: product.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
    })),

    images: product.images.map((image) => ({
      id: image.id,
      imageType: image.imageType,
      altText: image.altText,
      url: image.url ?? null,
    })),

    variantCount: product.variantCount
      ? Number(product.variantCount)
      : undefined,

    attributes:
      Array.isArray(product.attributes) && product.attributes.length
        ? product.attributes.map((attr) => ({
            id: attr.id,
            attributeKey: attr.attributeKey,
            attributeKeyDisplay: attr.attributeKeyDisplay,
            displayOrder: Number(attr.displayOrder),
          }))
        : undefined,
  });
}
