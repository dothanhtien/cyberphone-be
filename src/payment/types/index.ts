import { CreatePaymentDto } from '../dto';
import { Payment } from '../entities';
import { Order } from '@/orders/entities';

export * from './momo';

export interface PaymentStrategy {
  createPaymentUrl({
    createPaymentDto,
    order,
    payment,
  }: CreatePaymentUrlParams): Promise<{ payUrl: string }>;
  verifyPayment(data: unknown): PaymentResult;
}

export interface CreatePaymentUrlParams {
  createPaymentDto: CreatePaymentDto;
  order: Order;
  payment: Payment;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  orderType?: string;
  message: string;
  rawData: Record<string, any>;
}
