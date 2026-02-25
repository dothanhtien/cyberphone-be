export interface RawProductRow {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  is_featured: boolean;
  is_bestseller: boolean;
  price: string | null;
  sale_price: string | null;
  in_stock: number;
  main_image: string | null;
}
