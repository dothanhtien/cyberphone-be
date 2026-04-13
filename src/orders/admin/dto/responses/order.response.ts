import { Expose } from 'class-transformer';
import { OrderStatus } from '@/orders/enums';
import { PaymentMethod, PaymentStatus } from '@/payment/enums';

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
    phone: string;
    email: string | null;
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
    attributes: Record<string, any> | null;
  }[];
}
