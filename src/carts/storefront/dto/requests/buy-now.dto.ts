import { IsOptional, IsUUID } from 'class-validator';

export class BuyNowDto {
  @IsUUID('4', { message: 'Variant Id must be a valid UUID (v4)' })
  variantId: string;

  @IsUUID('4', { message: 'Customer Id must be a valid UUID (v4)' })
  @IsOptional()
  customerId?: string;
}
