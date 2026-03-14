import { Expose } from 'class-transformer';

export class BrandCreateEntityInput {
  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string;

  @Expose()
  websiteUrl?: string;

  @Expose()
  createdBy: string;
}
