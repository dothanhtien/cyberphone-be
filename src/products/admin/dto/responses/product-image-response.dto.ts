import { Expose } from 'class-transformer';

export class ProductImageResponseDto {
  @Expose()
  id: string;

  @Expose()
  imageType: string;

  @Expose()
  altText: string | null;

  @Expose()
  url: string | null;
}
