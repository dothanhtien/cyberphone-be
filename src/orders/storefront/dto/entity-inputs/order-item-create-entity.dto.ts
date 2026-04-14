import { Expose } from 'class-transformer';

export class OrderItemCreateEntityDto {
  @Expose()
  orderId: string;

  @Expose()
  productId: string;

  @Expose()
  productName: string;

  @Expose()
  variantId: string;

  @Expose()
  variantName: string;

  @Expose()
  sku: string;

  @Expose()
  attributes: Record<string, unknown> | null;

  @Expose()
  unitPrice: string;

  @Expose()
  salePrice: string | null;

  @Expose()
  quantity: number;

  @Expose()
  itemTotal: string;
}
