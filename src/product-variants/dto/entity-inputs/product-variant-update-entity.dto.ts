import { Expose } from 'class-transformer';

export class ProductVariantUpdateEntityDto {
  @Expose()
  sku?: string;

  @Expose()
  name?: string;

  @Expose()
  price?: string;

  @Expose()
  salePrice?: string | null;

  @Expose()
  costPrice?: string | null;

  @Expose()
  stockQuantity?: number;

  @Expose()
  stockStatus?: string;

  @Expose()
  lowStockThreshold?: number;

  @Expose()
  isDefault?: boolean;

  @Expose()
  isActive?: boolean;

  @Expose()
  updatedBy?: string;
}
