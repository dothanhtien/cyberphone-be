import { Expose } from 'class-transformer';
import { ProductImageType } from '@/common/enums';

export class ProductImageCreateEntityDto {
  @Expose()
  productId: string;

  @Expose()
  variantId?: string | null;

  @Expose()
  imageType: ProductImageType;

  @Expose()
  altText?: string | null;

  @Expose()
  title?: string | null;

  @Expose()
  displayOrder: number;

  @Expose()
  createdBy: string;
}
