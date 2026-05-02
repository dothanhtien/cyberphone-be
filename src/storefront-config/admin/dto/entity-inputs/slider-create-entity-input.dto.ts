import { Expose } from 'class-transformer';

export class SliderCreateEntityInput {
  @Expose()
  id: string;

  @Expose()
  title?: string | null;

  @Expose()
  altText?: string | null;

  @Expose()
  displayOrder?: number;

  @Expose()
  createdBy: string;
}
