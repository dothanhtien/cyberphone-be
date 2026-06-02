import { Expose } from 'class-transformer';
import { CartType } from '@/carts/enums';

export class CartCreateEntityInput {
  @Expose()
  customerId?: string;

  @Expose()
  sessionId: string;

  @Expose()
  expiresAt: Date;

  @Expose()
  type?: CartType;
}
