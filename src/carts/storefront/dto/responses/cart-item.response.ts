import { Expose } from 'class-transformer';
import { ProductVariantStockStatus } from '@/common/enums';

export class CartItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  quantity: number;

  @Expose()
  variantId: string;

  @Expose()
  variantName: string;

  @Expose()
  price: string;

  @Expose()
  salePrice: string | null;

  @Expose()
  stockStatus: ProductVariantStockStatus;

  @Expose()
  imageUrl: string | null;
}
