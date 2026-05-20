import { Expose } from 'class-transformer';

export class StorefrontSliderUpdateEntityInput {
  @Expose()
  title?: string | null;

  @Expose()
  altText?: string | null;

  @Expose()
  displayOrder?: number;

  @Expose()
  isActive?: boolean;

  @Expose()
  updatedBy: string;
}
