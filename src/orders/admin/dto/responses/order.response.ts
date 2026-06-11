import { Expose } from 'class-transformer';
import { OrderStatus } from '@/orders/enums';
import { PaymentMethod, PaymentProvider, PaymentStatus } from '@/payment/enums';

export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  customer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;

  @Expose()
  orderTotal: string;

  @Expose()
  paymentStatus: PaymentStatus;

  @Expose()
  orderStatus: OrderStatus;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string | null;
}

export class OrderDetailsResponseDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  customer: {
    id: string;
    email: string;
    phone: string | null;
    firstName: string;
    lastName: string;
  } | null;

  @Expose()
  shipping: {
    name: string;
    phone: string;
    email: string | null;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    district: string;
    ward: string;
    postalCode: string | null;
    country: string;
    note: string | null;
    method: string;
    fee: string;
    total: string;
  };

  @Expose()
  paymentMethod: PaymentMethod;

  @Expose()
  paymentStatus: PaymentStatus;

  @Expose()
  itemsTotal: string;

  @Expose()
  discountTotal: string;

  @Expose()
  taxTotal: string;

  @Expose()
  orderTotal: string;

  @Expose()
  orderStatus: OrderStatus;

  @Expose()
  items: {
    id: string;
    variantName: string;
    sku: string;
    attributes: Record<string, unknown> | null;
  }[];

  @Expose()
  payments: {
    id: string;
    transactionId: string | null;
    amount: string;
    currency: string;
    provider: PaymentProvider;
    paymentMethod: string | null;
    status: PaymentStatus;
    failureReason: string | null;
    paidAt: Date | null;
    refundedAt: Date | null;
    refundTransactionId: string | null;
    checkoutUrl: string | null;
    createdAt: Date;
  }[];
}
