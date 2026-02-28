import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

const MAX_LENGTH = 255;

export class CreateProductAttributeDto {
  @MaxLength(MAX_LENGTH, {
    message: `Attribute key must not exceed ${MAX_LENGTH} characters`,
  })
  @IsString({ message: 'Attribute key must be a string' })
  @IsNotEmpty({ message: 'Attribute key is required' })
  attributeKey: string;

  @MaxLength(MAX_LENGTH, {
    message: `Attribute key display must not exceed ${MAX_LENGTH} characters`,
  })
  @IsString({ message: 'Attribute key display must be a string' })
  @IsNotEmpty({ message: 'Attribute key display is required' })
  attributeKeyDisplay: string;

  @IsInt({ message: 'Display order must be an integer' })
  @Min(0, { message: 'Display order must be greater than or equal to 0' })
  displayOrder: number;
}
