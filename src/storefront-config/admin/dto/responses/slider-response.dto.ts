import { Expose } from 'class-transformer';

export class SliderResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string | null;

  @Expose()
  altText: string | null;

  @Expose()
  url: string | null;

  @Expose()
  displayOrder: number;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  createdBy: string;

  @Expose()
  updatedAt: Date | null;

  @Expose()
  updatedBy: string | null;
}
