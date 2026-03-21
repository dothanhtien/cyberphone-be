import { Expose } from 'class-transformer';

export class ProductAttributeResponseDto {
  @Expose()
  id: string;

  @Expose()
  attributeKey: string;

  @Expose()
  attributeKeyDisplay?: string;

  @Expose()
  displayOrder: number;
}
