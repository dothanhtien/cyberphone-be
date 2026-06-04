export class CategoryChildResponseDto {
  id: string;
  name: string;
  slug: string;
}

export class StorefrontConfigurationResponseDto {
  id: string;
  categoryId: string;
  categoryName: string | null;
  categorySlug: string | null;
  title: string | null;
  icon: string | null;
  displayOrder: number;
  enabled: boolean;
  children: CategoryChildResponseDto[];
}
