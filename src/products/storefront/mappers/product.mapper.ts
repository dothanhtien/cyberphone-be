import { plainToInstance } from 'class-transformer';
import { RawProductRow } from '../types';
import { StorefrontProductResponseDto } from '../dto/responses/product-response.dto';

export function mapToStorefrontProductResponse(
  product: RawProductRow,
): StorefrontProductResponseDto {
  return plainToInstance(
    StorefrontProductResponseDto,
    {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.short_description,
      price: product.price ? Number(product.price) : null,
      salePrice: product.sale_price ? Number(product.sale_price) : null,
      inStock: product.in_stock === 1,
      mainImage: product.main_image,
    },
    {
      excludeExtraneousValues: true,
    },
  );
}
