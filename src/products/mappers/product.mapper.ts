import { plainToInstance } from 'class-transformer';
import { Product } from '../entities/product.entity';
import { ProductResponseDto } from '../dto/responses/product-response.dto';

export function mapToProductResponse(product: Product): ProductResponseDto {
  return plainToInstance(
    ProductResponseDto,
    {
      ...product,
      categories: product.productCategories?.map((pc) => pc.category),
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
