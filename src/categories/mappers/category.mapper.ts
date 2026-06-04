import { toDto } from '@/common/utils';
import { CategoryResponseDto } from '../dto';
import { CategoryRaw } from '../types';

export class CategoryMapper {
  static mapToCategoryResponse(input: CategoryRaw): CategoryResponseDto {
    return toDto(CategoryResponseDto, {
      id: input.id,
      slug: input.slug,
      name: input.name,
      description: input.description,
      parentId: input.parentId,
      logo: input.logo,
      productCount: Number(input.productCount),
    });
  }
}
