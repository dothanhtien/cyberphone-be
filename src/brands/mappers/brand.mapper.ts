import { BrandResponseDto } from '../dto';
import { BrandWithExtras } from '../types';
import { toDto } from '@/common/utils';

export function mapToBrandResponse(brand: BrandWithExtras): BrandResponseDto {
  return toDto(BrandResponseDto, {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    websiteUrl: brand.websiteUrl,
    logo: brand.logo,
    productCount:
      brand.productCount !== null ? Number(brand.productCount) : undefined,
    isActive: brand.isActive,
    createdAt: brand.createdAt,
    createdBy: brand.createdBy,
    updatedAt: brand.updatedAt,
    updatedBy: brand.updatedBy,
  });
}
