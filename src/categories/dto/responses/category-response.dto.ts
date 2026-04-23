import { Expose } from 'class-transformer';

export class CategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description: string | null;

  @Expose()
  parentId: string | null;

  @Expose()
  logo: string | null;

  @Expose()
  productCount: number;
}
