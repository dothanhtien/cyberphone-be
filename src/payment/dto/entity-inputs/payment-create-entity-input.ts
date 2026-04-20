import { Expose } from 'class-transformer';
import { PaymentProvider } from '../../enums';

export class PaymentCreateEntityInput {
  @Expose()
  orderId: string;

  @Expose()
  provider: PaymentProvider;

  @Expose()
  amount: string;

  @Expose()
  orderInfo?: string | null;
}
