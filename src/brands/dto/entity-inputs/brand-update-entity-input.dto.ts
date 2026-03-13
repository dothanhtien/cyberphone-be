import { Expose } from 'class-transformer';

export class BrandUpdateEntityInput {
  @Expose()
  name?: string;

  @Expose()
  slug?: string;

  @Expose()
  description?: string;

  @Expose()
  websiteUrl?: string;

  @Expose()
  updatedBy: string;
}
