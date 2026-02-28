import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

const MAX_LENGTH = 255;

export class CreateVariantAttributeDto {
  @IsUUID('4', { message: 'Id must be a valid UUID (v4)' })
  productAttributeId: string;

  @MaxLength(MAX_LENGTH, {
    message: `Attribute value must not exceed ${MAX_LENGTH} characters`,
  })
  @IsString({ message: 'Attribute value must be a string' })
  @IsNotEmpty({ message: 'Attribute value is required' })
  attributeValue: string;

  @MaxLength(MAX_LENGTH, {
    message: `Attribute value display must not exceed ${MAX_LENGTH} characters`,
  })
  @IsString({ message: 'Attribute value display must be a string' })
  @IsOptional()
  attributeValueDisplay?: string | null;
}
