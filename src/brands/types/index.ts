import { Brand } from '../entities/brand.entity';

export type BrandWithExtras = Brand & {
  logo?: string | null;
  productCount?: number;
};

export interface BrandQueryRaw {
  logo: string | null;
  productCount?: string;
}
