import { Expose } from 'class-transformer';
import { OrderStatus } from '@/orders/enums';
import { PaymentStatus } from '@/payment/enums';

export class OrderUpdateEntityInput {
  @Expose()
  revision?: number;

  @Expose()
  paymentStatus?: PaymentStatus;

  @Expose()
  orderStatus?: OrderStatus;

  @Expose()
  updatedBy: string;
}
