import { Expose } from 'class-transformer';

export class CartItemUpdateEntityInput {
  @Expose()
  quantity?: number;

  @Expose()
  isActive?: boolean;

  @Expose()
  updatedBy: string;
}
