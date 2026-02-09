import { Expose } from 'class-transformer';

export class ProductVariantCreateEntityDto {
  @Expose()
  productId: string;

  @Expose()
  sku: string;

  @Expose()
  name: string;

  @Expose()
  price: string;

  @Expose()
  salePrice?: string;

  @Expose()
  costPrice?: string;

  @Expose()
  stockQuantity?: number;

  @Expose()
  stockStatus?: string;

  @Expose()
  lowStockThreshold?: number;

  @Expose()
  isDefault?: boolean;

  @Expose()
  createdBy: string;
}
