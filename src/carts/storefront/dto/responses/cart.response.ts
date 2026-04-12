import { Expose } from 'class-transformer';
import { CartItemResponseDto } from './cart-item.response';

export class CartResponseDto {
  @Expose()
  id: string;

  @Expose()
  customerId: string | null;

  @Expose()
  sessionId: string;

  @Expose()
  expiresAt: string;

  @Expose()
  items: CartItemResponseDto[];
}
