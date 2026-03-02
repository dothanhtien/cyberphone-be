import { Expose } from 'class-transformer';

export class CartItemCreateEntityInput {
  @Expose()
  cartId: string;

  @Expose()
  variantId: string;

  @Expose()
  quantity: number;

  @Expose()
  createdBy: string;
}
