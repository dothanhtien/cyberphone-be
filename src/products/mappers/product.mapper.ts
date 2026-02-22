import { plainToInstance } from 'class-transformer';
import { Product } from '../entities/product.entity';
import { ProductResponseDto } from '../dto/responses/product-response.dto';
import { MediaAsset } from '@/media-assets/entities/media-asset.entity';
import { ProductImage } from '../entities/product-image.entity';

type ProductImageWithMedia = ProductImage & {
  media?: MediaAsset | null;
};

export function mapToProductResponse(product: Product): ProductResponseDto {
  return plainToInstance(
    ProductResponseDto,
    {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription ?? null,
      longDescription: product.longDescription ?? null,
      status: product.status,
      isFeatured: product.isFeatured,
      isBestseller: product.isBestseller,
      brand: product.brand,
      isActive: product.isActive,
      createdAt: product.createdAt,
      createdBy: product.createdBy,
      updatedAt: product.updatedAt,
      updatedBy: product.updatedBy ?? null,

      categories: product.categories?.map((pc) => pc.category) ?? [],

      images:
        (product.productImages as ProductImageWithMedia[])?.map((img) => ({
          id: img.id,
          imageType: img.imageType,
          altText: img.altText,
          url: img.media?.url ?? null,
        })) ?? [],
    },
    {
      excludeExtraneousValues: true,
    },
  );
}

export function mapToProductResponseList(
  products: Product[],
): ProductResponseDto[] {
  return products.map(mapToProductResponse);
}
