import { Category } from '@/categories/entities/category.entity';

export type CategoryWithLogo = Category & {
  logo: string | null;
  children: CategoryWithLogo[];
};
