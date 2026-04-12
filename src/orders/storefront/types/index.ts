import { Cart } from '@/carts/entities';

export interface OrderCalculationInput {
  cart: Cart;
  shippingFee?: number;
  discountTotal?: number;
  taxTotal?: number;
}

export interface OrderCalculationResult {
  itemsTotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  orderTotal: number;
}
