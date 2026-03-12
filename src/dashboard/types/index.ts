import { OrderStatus } from '@/orders/enums';
import { PaymentStatus } from '@/payment/enums';

export interface SummaryRaw {
  total_orders: string;
  total_revenue: string;
}

export interface RevenueRaw {
  date: string;
  revenue: string;
}

export interface CategorySalesRaw {
  category: string;
  total: string;
}

export interface TopProductRaw {
  id: string;
  name: string;
  total_sales: string;
  image_url: string;
}

export interface RecentOrderRaw {
  id: string;
  code: string;
  order_total: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
}
