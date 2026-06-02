import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Big from 'big.js';
import dayjs from 'dayjs';
import { DataSource, EntityManager } from 'typeorm';
import {
  CreateOrderDto,
  OrderCreateEntityInput,
  OrderItemCreateEntityDto,
} from './dto';
import { OrderCalculationInput, OrderCalculationResult } from './types';
import { OrderUpdateEntityInput } from '../admin/dto';
import { Order } from '../entities';
import { OrderStatus } from '../enums';
import {
  type IOrderItemRepository,
  type IOrderRepository,
  ORDER_ITEM_REPOSITORY,
  ORDER_REPOSITORY,
} from '../repositories';
import { isUniqueConstraintError, sanitizeEntityInput } from '@/common/utils';
import { PaymentStatus } from '@/payment/enums';
import { AdminProductVariantsService } from '@/products/admin/admin-product-variants.service';

@Injectable()
export class StorefrontOrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(ORDER_ITEM_REPOSITORY)
    private readonly orderItemRepository: IOrderItemRepository,
    private readonly productVariantsService: AdminProductVariantsService,
  ) {}

  private static readonly PAYMENT_TTL_MS = 15 * 60 * 1000;

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.dataSource.transaction(async (tx) => {
      const cart = await this.orderRepository.findCartForOrderCreation(
        createOrderDto.cartId,
        tx,
      );

      if (!cart) {
        throw new NotFoundException('Cart not found or expired');
      }

      if (!cart.items.length) {
        throw new NotFoundException('Cart is empty');
      }

      const existingPending = await this.orderRepository.findPendingByCartId(
        cart.id,
        tx,
      );

      if (existingPending) {
        const pendingPayment = existingPending.payments?.find(
          (p) => p.status === PaymentStatus.PENDING,
        );

        const referenceTime =
          pendingPayment?.createdAt ?? existingPending.createdAt;

        if (
          Date.now() - referenceTime.getTime() <
          StorefrontOrdersService.PAYMENT_TTL_MS
        ) {
          return existingPending;
        }

        await this.productVariantsService.restoreStock(
          existingPending.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          tx,
        );

        await this.orderRepository.update(
          existingPending.id,
          sanitizeEntityInput(OrderUpdateEntityInput, {
            orderStatus: OrderStatus.CANCELLED,
            updatedBy: 'system',
          }),
          tx,
        );
      }

      const shippingFee = new Big(0);

      const { orderTotal, itemsTotal, shippingTotal, discountTotal, taxTotal } =
        this.calculateOrder({
          cart,
          shippingFee,
          discountTotal: new Big(0),
          taxTotal: new Big(0),
        });

      const lastRevision = await this.orderRepository.findLastRevisionByCartId(
        cart.id,
        tx,
      );
      const nextRevision = (lastRevision?.revision ?? 0) + 1;
      const orderCode =
        lastRevision?.code ?? (await this.generateOrderCode(tx));

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

      let savedOrder: Order;
      try {
        savedOrder = await this.orderRepository.save(order, tx);
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          const concurrent = await this.orderRepository.findPendingByCartId(
            cart.id,
            tx,
          );
          if (concurrent) return concurrent;
        }
        throw error;
      }

      const orderItems = cart.items.map((item) => {
        const price = new Big(item.variant.price);
        const salePrice = item.variant.salePrice
          ? new Big(item.variant.salePrice)
          : null;
        const effectivePrice = salePrice ?? price;
        const itemTotal = effectivePrice.times(item.quantity);

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

      await this.productVariantsService.reserveStock(
        cart.items.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        tx,
      );

      savedOrder.items = savedItems;

      return savedOrder;
    });
  }

  private async generateOrderCode(tx: EntityManager): Promise<string> {
    const seq = await this.orderRepository.getNextSequence(tx);

    return `ODR${dayjs().format('YYYYMMDD')}${String(seq).padStart(6, '0')}`;
  }

  private calculateOrder({
    cart,
    shippingFee = new Big(0),
    discountTotal = new Big(0),
    taxTotal = new Big(0),
  }: OrderCalculationInput): OrderCalculationResult {
    let itemsTotal = new Big(0);

    for (const item of cart.items) {
      const price = new Big(item.variant.price);
      const salePrice = item.variant.salePrice
        ? new Big(item.variant.salePrice)
        : null;
      itemsTotal = itemsTotal.plus((salePrice ?? price).times(item.quantity));
    }

    const shippingTotal = shippingFee;
    const orderTotal = itemsTotal
      .minus(discountTotal)
      .plus(taxTotal)
      .plus(shippingTotal);

    return {
      itemsTotal,
      discountTotal,
      taxTotal,
      shippingTotal,
      orderTotal,
    };
  }
}
