import { Expose } from 'class-transformer';
import { PaymentStatus } from '../../enums';

export class PaymentUpdateEntityInput {
  @Expose()
  status?: PaymentStatus;

  @Expose()
  transactionId?: string | null;

  @Expose()
  failureReason?: string | null;

  @Expose()
  rawResponse?: Record<string, any> | null;

  @Expose()
  paidAt?: Date | null;

  @Expose()
  paymentMethod?: string | null;
}
