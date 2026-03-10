import { Expose } from 'class-transformer';
import { DeviceType, OrderStatus } from '@/orders/enums';
import { PaymentMethod, PaymentStatus } from '@/payment/enums';

export class OrderCreateEntityInput {
  @Expose()
  code: string;

  @Expose()
  cartId: string;

  @Expose()
  revision: number;

  @Expose()
  customerId: string | null;

  @Expose()
  shippingName: string;

  @Expose()
  shippingPhone: string;

  @Expose()
  shippingEmail: string | null;

  @Expose()
  shippingAddressLine1: string;

  @Expose()
  shippingAddressLine2: string | null;

  @Expose()
  shippingCity: string;

  @Expose()
  shippingState: string;

  @Expose()
  shippingDistrict: string;

  @Expose()
  shippingWard: string;

  @Expose()
  shippingPostalCode: string | null;

  @Expose()
  shippingCountry: string;

  @Expose()
  shippingNote: string | null;

  @Expose()
  paymentMethod: PaymentMethod;

  @Expose()
  paymentStatus: PaymentStatus;

  @Expose()
  shippingMethod: string;

  @Expose()
  shippingFee: string;

  @Expose()
  itemsTotal: string;

  @Expose()
  discountTotal: string;

  @Expose()
  taxTotal: string;

  @Expose()
  shippingTotal: string;

  @Expose()
  orderTotal: string;

  @Expose()
  orderStatus: OrderStatus;

  @Expose()
  deviceType: DeviceType;

  @Expose()
  createdBy: string;
}
