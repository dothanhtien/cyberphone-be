import { Expose } from 'class-transformer';

export class ProductAttributeUpdateEntityDto {
  @Expose()
  productId?: string;

  @Expose()
  attributeKey?: string;

  @Expose()
  attributeKeyDisplay?: string;

  @Expose()
  displayOrder?: number;

  @Expose()
  isActive?: boolean;

  @Expose()
  updatedBy: string;
}
