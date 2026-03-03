import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import dayjs from 'dayjs';
import { OrderCalculationInput, OrderCalculationResult } from './types';
import { Cart } from '@/carts/entities/cart.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderDto } from './dto/requests/create-order.dto';
import { sanitizeEntityInput } from '@/common/utils/entities';
import { OrderCreateEntityInput } from './dto/entity-inputs/order-create-entity.dto';
import { OrderStatus, PaymentStatus } from '../enums';

@Injectable()
export class StorefrontOrdersService {
  constructor(private readonly dataSource: DataSource) {}

  async create(createOrderDto: CreateOrderDto) {
    return await this.dataSource.transaction(async (tx) => {
      const cart = await tx
        .getRepository(Cart)
        .createQueryBuilder('cart')
        .leftJoin('cart.items', 'item', 'item.isActive = :isActive', {
          isActive: true,
        })
        .leftJoin('item.variant', 'variant')
        .leftJoin('variant.product', 'product')
        .leftJoinAndSelect('variant.attributes', 'attributes')
        .leftJoinAndSelect('attributes.productAttribute', 'productAttribute')
        .where('cart.id = :cartId', { cartId: createOrderDto.cartId })
        .andWhere('cart.isActive = :cartActive', { cartActive: true })
        .select([
          'cart.id',
          'cart.userId',
          'cart.sessionId',

          'item.id',
          'item.quantity',
          'item.variantId',

          'variant.id',
          'variant.sku',
          'variant.name',
          'variant.price',
          'variant.salePrice',

          'product.id',
          'product.name',

          'attributes.id',
          'attributes.attributeValue',
          'attributes.attributeValueDisplay',

          'productAttribute.id',
          'productAttribute.attributeKey',
          'productAttribute.attributeKeyDisplay',
        ])
        .getOne();

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      if (!cart || !cart.items.length) {
        throw new NotFoundException('Cart not found or empty');
      }

      const shippingFee = 0;
      const discountTotal = 0;
      const taxTotal = 0;

      const { orderTotal, itemsTotal, shippingTotal } = this.calculateOrder({
        cart,
        shippingFee,
        discountTotal,
        taxTotal,
      });

      const orderCode = await this.generateOrderCode(tx);

      const order = sanitizeEntityInput(OrderCreateEntityInput, {
        code: orderCode,
        customerId: cart.userId ?? null,
        shippingName: createOrderDto.shippingName,
        shippingPhone: createOrderDto.shippingPhone,
        shippingEmail: createOrderDto.shippingEmail,
        shippingAddressLine1: createOrderDto.shippingAddressLine1,
        shippingAddressLine2: createOrderDto.shippingAddressLine2,
        shippingCity: createOrderDto.shippingCity,
        shippingState: createOrderDto.shippingState,
        shippingDistrict: createOrderDto.shippingDistrict,
        shippingWard: createOrderDto.shippingWard,
        shippingPostalCode: createOrderDto.shippingPostalCode,
        shippingCountry: createOrderDto.shippingCountry ?? 'Vietnam',
        shippingNote: createOrderDto.shippingNote,
        paymentMethod: createOrderDto.paymentMethod,
        paymentStatus: createOrderDto.paymentStatus ?? PaymentStatus.PENDING,
        shippingMethod: createOrderDto.shippingMethod,
        shippingFee: shippingFee.toFixed(2),
        itemsTotal: itemsTotal.toFixed(2),
        discountTotal: discountTotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        shippingTotal: shippingTotal.toFixed(2),
        orderTotal: orderTotal.toFixed(2),
        orderStatus: OrderStatus.PENDING,
        createdBy: cart.userId ?? cart.sessionId ?? 'guest',
      });

      const savedOrder = await tx.save(Order, order);

      const orderItems = cart.items.map((item) => {
        const price = parseFloat(item.variant.price);
        const salePrice = item.variant.salePrice
          ? parseFloat(item.variant.salePrice)
          : null;
        const itemTotal = item.quantity * (salePrice ?? price);

        return tx.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.variant.product.id,
          productName: item.variant.product.name,
          variantId: item.variant.id,
          variantName: item.variant.name,
          sku: item.variant.sku,
          attributes: item.variant.attributes.map((attr) => ({
            key: attr.productAttribute.attributeKey,
            displayKey: attr.productAttribute.attributeKeyDisplay,
            value: attr.attributeValue,
            displayValue: attr.attributeValueDisplay,
          })),
          unitPrice: price.toFixed(2),
          salePrice: salePrice?.toFixed(2) ?? null,
          quantity: item.quantity,
          itemTotal: itemTotal.toFixed(2),
        });
      });

      const savedItems = await tx.save(orderItems);

      savedOrder.items = savedItems;

      return savedOrder;
    });
  }

  private async generateOrderCode(tx: EntityManager): Promise<string> {
    const [{ nextval }] = await tx.query<{ nextval: string }[]>(
      `SELECT nextval('order_sequence')`,
    );

    const seq = Number(nextval);
    return `CP-ODR-${dayjs().format('YYYYMMDD')}-${String(seq).padStart(8, '0')}`;
  }

  private calculateOrder({
    cart,
    shippingFee = 0,
    discountTotal = 0,
    taxTotal = 0,
  }: OrderCalculationInput): OrderCalculationResult {
    let itemsTotal = 0;

    for (const item of cart.items) {
      const price = parseFloat(item.variant.price);
      itemsTotal += price * item.quantity;
    }

    const shippingTotal = shippingFee;

    const orderTotal = itemsTotal - discountTotal + taxTotal + shippingTotal;

    return {
      itemsTotal,
      discountTotal,
      taxTotal,
      shippingTotal,
      orderTotal,
    };
  }
}
