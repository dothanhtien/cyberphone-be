import { Cart } from '@/carts/entities/cart.entity';

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
