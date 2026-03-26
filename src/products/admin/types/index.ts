import { ProductImageType, ProductStatus } from '@/common/enums';

export interface ProductRaw {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  shortDescription?: string | null;
  longDescription?: string | null;
  isFeatured: boolean;
  isBestseller: boolean;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string;

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
    displayOrder: string;
  }[];

  variantCount?: string;
}
