import { Expose } from 'class-transformer';

export class CategoryUpdateEntityDto {
  @Expose()
  name?: string;

  @Expose()
  slug?: string;

  @Expose()
  description?: string | null;

  @Expose()
  parentId?: string | null;

  @Expose()
  isActive?: boolean;

  @Expose()
  updatedBy: string;
}
