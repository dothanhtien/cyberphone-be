import { ProductVariantStockStatus } from '@/common/enums';

export interface RawCartRow {
  id: string;
  user_id: string;
  session_id: string;
  expires_at: string;
  items: {
    id: string;
    quantity: number;
    variantId: string;
    variantName: string;
    price: string;
    salePrice: string | null;
    stockStatus: ProductVariantStockStatus;
    imageUrl: string | null;
  }[];
}
