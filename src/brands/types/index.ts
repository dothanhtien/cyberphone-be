import { Brand } from '../entities';

export type BrandWithExtras = Brand & {
  logo?: string | null;
  productCount?: number;
};

export interface BrandQueryRaw {
  logo: string | null;
  product_count?: string;
}
