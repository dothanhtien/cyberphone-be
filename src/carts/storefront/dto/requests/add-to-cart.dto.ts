import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';
import { ResolveCartDto } from './resolve-cart.dto';

export class AddToCartDto extends ResolveCartDto {
  @IsUUID('4', { message: 'Variant Id must be a valid UUID (v4)' })
  variantId: string;

  @Min(0, { message: 'Quantity must be greater than or equal to 0' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Type(() => Number)
  quantity: number;
}
