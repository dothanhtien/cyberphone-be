import { StorefrontConfigurationResponseDto } from '../dto';
import { StorefrontConfiguration } from '../entities';

export class StorefrontConfigurationMapper {
  static mapToStorefrontConfigurationResponse(
    item: StorefrontConfiguration,
  ): StorefrontConfigurationResponseDto {
    return {
      id: item.id,
      categoryId: item.categoryId!,
      categoryName: item.category?.name ?? null,
      categorySlug: item.category?.slug ?? null,
      title: item.title,
      icon: item.icon,
      displayOrder: item.displayOrder,
      enabled: item.isActive,
      children: (item.category?.children ?? []).map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
      })),
    };
  }
}
