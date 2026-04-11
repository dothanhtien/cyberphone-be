import { Expose } from 'class-transformer';
import { ProductVariantStockStatus } from '@/common/enums';

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
  stockStatus?: ProductVariantStockStatus;

  @Expose()
  lowStockThreshold?: number;

  @Expose()
  isDefault?: boolean;

  @Expose()
  isActive?: boolean;

  @Expose()
  updatedBy?: string;
}
