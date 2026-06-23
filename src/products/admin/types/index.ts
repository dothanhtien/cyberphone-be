import {
  ProductImageType,
  ProductStatus,
  ProductVariantStockStatus,
} from '@/common/enums';

export interface ProductVariantBaseRaw {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: string;
  salePrice: string | null;
  costPrice: string | null;
  stockQuantity: number;
  stockStatus: ProductVariantStockStatus;
  lowStockThreshold: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface ProductVariantRaw extends ProductVariantBaseRaw {
  attributes: {
    id: string;
    productAttributeId: string;
    attributeValue: string;
    attributeValueDisplay: string | null;
  }[];
  images: {
    id: string;
    imageType: ProductImageType;
    displayOrder: number;
    altText: string | null;
    url: string | null;
  }[];
}

export interface ProductVariantListRaw extends ProductVariantBaseRaw {
  mainImageUrl: string | null;
}

export interface ProductRaw {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  shortDescription: string | null;
  longDescription: string | null;
  isFeatured: boolean;
  isBestseller: boolean;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  brand: { id: string; name: string };
  categories: { id: string; name: string }[];
  images: {
    id: string;
    imageType: ProductImageType;
    altText: string | null;
    url: string | null;
  }[];
  attributes?: {
    id: string;
    attributeKey: string;
    attributeKeyDisplay: string;
    displayOrder: number;
  }[];
  variantCount?: string;
}
