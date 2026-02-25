import { Expose } from 'class-transformer';

export class StorefrontProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  shortDescription: string | null;

  @Expose()
  isFeatured: boolean;

  @Expose()
  isBestseller: boolean;

  @Expose()
  price: number;

  @Expose()
  salePrice: number;

  @Expose()
  inStock: boolean;

  @Expose()
  mainImage: string | null;
}
