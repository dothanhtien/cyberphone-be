import { Brand } from '@/brands/entities/brand.entity';

export type BrandWithLogo = Brand & { logo: string | null };
