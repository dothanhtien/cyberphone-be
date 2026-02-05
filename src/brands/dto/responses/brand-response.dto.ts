import { Expose } from 'class-transformer';

export class BrandResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description: string | null;

  @Expose()
  websiteUrl: string | null;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  createdBy: string;

  @Expose()
  updatedAt: Date;

  @Expose()
  updatedBy: string | null;
}
