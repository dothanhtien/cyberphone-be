import { OrderStatus } from '@/orders/enums';
import { PaymentStatus } from '@/payment/enums';

export interface OrderRaw {
  id: string;
  code: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  orderTotal: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string | null;
}
