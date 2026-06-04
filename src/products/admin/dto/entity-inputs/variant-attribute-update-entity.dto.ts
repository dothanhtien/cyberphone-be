import { Expose } from 'class-transformer';

export class VariantAttributeUpdateEntityDto {
  @Expose()
  attributeValue: string;

  @Expose()
  attributeValueDisplay?: string | null;

  @Expose()
  updatedBy: string;
}
