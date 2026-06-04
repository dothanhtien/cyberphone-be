import { Brand } from '../entities';

export type BrandWithExtras = Brand & {
  logo?: string | null;
  productCount?: string;
};

export interface BrandQueryRaw {
  logo: string | null;
  product_count?: string;
}
