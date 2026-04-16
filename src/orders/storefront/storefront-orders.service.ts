import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import dayjs from 'dayjs';
import {
  CreateOrderDto,
  OrderCreateEntityInput,
  OrderItemCreateEntityDto,
} from './dto';
import {
  type IOrderItemRepository,
  type IOrderRepository,
  ORDER_ITEM_REPOSITORY,
  ORDER_REPOSITORY,
} from '../repositories';
import { OrderCalculationInput, OrderCalculationResult } from './types';
import { sanitizeEntityInput } from '@/common/utils';

@Injectable()
export class StorefrontOrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(ORDER_ITEM_REPOSITORY)
    private readonly orderItemRepository: IOrderItemRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    return await this.dataSource.transaction(async (tx) => {
      const cart = await this.orderRepository.findCartForOrderCreation(
        createOrderDto.cartId,
        tx,
      );

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      if (!cart.items.length) {
        throw new NotFoundException('Cart is empty');
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

      const lastRevision = await this.orderRepository.findLastRevisionByCartId(
        cart.id,
        tx,
      );
      const nextRevision = (lastRevision ?? 0) + 1;

      const order = sanitizeEntityInput(OrderCreateEntityInput, {
        ...createOrderDto,
        code: orderCode,
        cartId: cart.id,
        revision: nextRevision,
        customerId: cart.customerId ?? null,
        shippingCountry: createOrderDto.shippingCountry ?? 'Vietnam',
        shippingFee: shippingFee.toFixed(2),
        itemsTotal: itemsTotal.toFixed(2),
        discountTotal: discountTotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        shippingTotal: shippingTotal.toFixed(2),
        orderTotal: orderTotal.toFixed(2),
        createdBy: cart.customerId ?? cart.sessionId ?? 'guest',
      });

      const savedOrder = await this.orderRepository.save(order, tx);

      const orderItems = cart.items.map((item) => {
        const price = parseFloat(item.variant.price);
        const salePrice = item.variant.salePrice
          ? parseFloat(item.variant.salePrice)
          : null;
        const itemTotal = item.quantity * (salePrice ?? price);

        return sanitizeEntityInput(OrderItemCreateEntityDto, {
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

      const savedItems = await this.orderItemRepository.save(orderItems, tx);

      savedOrder.items = savedItems;

      return savedOrder;
    });
  }

  private async generateOrderCode(tx: EntityManager): Promise<string> {
    const seq = await this.orderRepository.getNextSequence(tx);

    return `ODR${dayjs().format('YYYYMMDD')}${seq}`;
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
      const salePrice = item.variant.salePrice
        ? parseFloat(item.variant.salePrice)
        : null;
      itemsTotal += (salePrice ?? price) * item.quantity;
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
