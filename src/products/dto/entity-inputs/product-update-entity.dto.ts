import { Expose } from 'class-transformer';
import { ProductStatus } from '@/common/enums';

export class ProductUpdateEntityDto {
  @Expose()
  name?: string;

  @Expose()
  slug?: string;

  @Expose()
  shortDescription?: string;

  @Expose()
  longDescription?: string;

  @Expose()
  status?: ProductStatus;

  @Expose()
  isFeatured?: boolean;

  @Expose()
  isBestseller?: boolean;

  @Expose()
  brandId?: string;

  @Expose()
  updatedBy: string;
}
