import { Expose } from 'class-transformer';

export class ProductAttributeCreateEntityDto {
  @Expose()
  productId: string;

  @Expose()
  attributeKey: string;

  @Expose()
  attributeKeyDisplay: string;

  @Expose()
  displayOrder: number;

  @Expose()
  createdBy: string;
}
