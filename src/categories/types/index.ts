export interface CategoryRaw {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  logo: string | null;
  productCount: string;
}
