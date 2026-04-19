import { Expose } from 'class-transformer';

export class CategoryCreateEntityDto {
  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string | null;

  @Expose()
  parentId?: string | null;

  @Expose()
  createdBy: string;
}
