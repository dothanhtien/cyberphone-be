import { Expose } from 'class-transformer';

export class VariantAttributeCreateEntityDto {
  @Expose()
  variantId: string;

  @Expose()
  productAttributeId: string;

  @Expose()
  attributeValue: string;

  @Expose()
  attributeValueDisplay?: string | null;

  @Expose()
  createdBy: string;
}
