import { OrderDetailsResponseDto, OrderResponseDto } from '../dto';
import { OrderRaw } from '../types';
import { toDto } from '@/common/utils';
import { Order } from '@/orders/entities';

export class OrderMapper {
  static mapToOrderResponse(input: OrderRaw): OrderResponseDto {
    const customer = input.customer
      ? {
          id: input.customer.id,
          firstName: input.customer.firstName,
          lastName: input.customer.lastName,
        }
      : null;

    return toDto(OrderResponseDto, {
      id: input.id,
      code: input.code,
      customer,
      orderTotal: input.orderTotal,
      orderStatus: input.orderStatus,
      paymentStatus: input.paymentStatus,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  static mapToOrderDetailsResponse(input: Order): OrderDetailsResponseDto {
    return toDto(OrderDetailsResponseDto, {
      id: input.id,
      code: input.code,
      customer: input.customer
        ? {
            id: input.customer.id,
            phone: input.customer.phone,
            email: input.customer.email,
            firstName: input.customer.firstName,
            lastName: input.customer.lastName,
          }
        : null,
      shipping: {
        name: input.shippingName,
        phone: input.shippingPhone,
        email: input.shippingEmail,
        line1: input.shippingAddressLine1,
        line2: input.shippingAddressLine2,
        city: input.shippingCity,
        state: input.shippingState,
        district: input.shippingDistrict,
        ward: input.shippingWard,
        postalCode: input.shippingPostalCode,
        country: input.shippingCountry,
        note: input.shippingNote,
        method: input.shippingMethod,
        fee: input.shippingFee,
        total: input.shippingTotal,
      },
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus,
      itemsTotal: input.itemsTotal,
      discountTotal: input.discountTotal,
      taxTotal: input.taxTotal,
      orderTotal: input.orderTotal,
      orderStatus: input.orderStatus,
      items: input.items.map((i) => ({
        id: i.id,
        variantName: i.variantName,
        sku: i.sku,
        attributes: i.attributes,
        unitPrice: i.unitPrice,
        salePrice: i.salePrice,
        quantity: i.quantity,
        itemTotal: i.itemTotal,
      })),
    });
  }
}
