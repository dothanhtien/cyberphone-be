import { Expose, Type } from 'class-transformer';
import { ProductImageType, ProductVariantStockStatus } from '@/common/enums';

export class VariantImageResponseDto {
  @Expose()
  id: string;

  @Expose()
  imageType: ProductImageType;

  @Expose()
  displayOrder: number;

  @Expose()
  altText: string | null;

  @Expose()
  url: string | null;
}

export class VariantAttributeResponseDto {
  @Expose()
  id: string;

  @Expose()
  productAttributeId: string;

  @Expose()
  attributeValue: string;

  @Expose()
  attributeValueDisplay: string | null;
}

export class BaseProductVariantResponseDto {
  @Expose()
  id: string;

  @Expose()
  productId: string;

  @Expose()
  sku: string;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  salePrice: number | null;

  @Expose()
  costPrice: number | null;

  @Expose()
  stockQuantity: number;

  @Expose()
  stockStatus: ProductVariantStockStatus;

  @Expose()
  lowStockThreshold: number;

  @Expose()
  isDefault: boolean;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  createdBy: string;

  @Expose()
  updatedAt: Date | null;

  @Expose()
  updatedBy: string | null;
}

export class ProductVariantResponseDto extends BaseProductVariantResponseDto {
  @Expose()
  @Type(() => VariantAttributeResponseDto)
  attributes: VariantAttributeResponseDto[];

  @Expose()
  @Type(() => VariantImageResponseDto)
  images: VariantImageResponseDto[];
}

export class ProductVariantListResponseDto extends BaseProductVariantResponseDto {
  @Expose()
  mainImageUrl: string | null;
}
