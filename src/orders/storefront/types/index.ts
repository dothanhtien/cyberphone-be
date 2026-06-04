import Big from 'big.js';
import { Cart } from '@/carts/entities';

export interface OrderCalculationInput {
  cart: Cart;
  shippingFee?: Big;
  discountTotal?: Big;
  taxTotal?: Big;
}

export interface OrderCalculationResult {
  itemsTotal: Big;
  discountTotal: Big;
  taxTotal: Big;
  shippingTotal: Big;
  orderTotal: Big;
}
