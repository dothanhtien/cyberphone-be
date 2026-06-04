import { Expose } from 'class-transformer';
import { ProductVariantStockStatus } from '@/common/enums';

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
  stockStatus?: ProductVariantStockStatus;

  @Expose()
  lowStockThreshold?: number;

  @Expose()
  isDefault?: boolean;

  @Expose()
  createdBy: string;
}
