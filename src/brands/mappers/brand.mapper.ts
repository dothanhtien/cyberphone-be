import { BrandResponseDto } from '../dto/responses/brand-response.dto';
import { BrandWithExtras } from '../types';
import { toDto } from '@/common/utils/mapper.util';

export function mapToBrandResponse(brand: BrandWithExtras): BrandResponseDto {
  return toDto(BrandResponseDto, {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description ?? null,
    logo: brand.logo,
    productCount: brand.productCount,
    isActive: brand.isActive,
    createdAt: brand.createdAt,
    createdBy: brand.createdBy,
    updatedAt: brand.updatedAt ?? null,
    updatedBy: brand.updatedBy ?? null,
  });
}
