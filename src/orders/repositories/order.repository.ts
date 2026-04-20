import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { OrderUpdateEntityInput } from '../admin/dto';
import { OrderRaw } from '../admin/types';
import { Order } from '../entities';
import { Cart } from '@/carts/entities';
import { CartStatus } from '@/carts/enums';

export interface IOrderRepository {
  countActive(): Promise<number>;
  findAllRaw(limit: number, offset: number): Promise<OrderRaw[]>;
  findOneActive(id: string, tx?: EntityManager): Promise<Order | null>;
  findOneActiveWithRelations(id: string): Promise<Order | null>;
  findCartForOrderCreation(
    cartId: string,
    tx: EntityManager,
  ): Promise<Cart | null>;
  findLastRevisionByCartId(
    cartId: string,
    tx: EntityManager,
  ): Promise<number | null>;
  getNextSequence(tx: EntityManager): Promise<number>;
  save(data: DeepPartial<Order>, tx: EntityManager): Promise<Order>;
  update(
    id: string,
    data: OrderUpdateEntityInput,
    tx: EntityManager,
  ): Promise<boolean>;
}

export const ORDER_REPOSITORY = Symbol('IOrderRepository');

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  countActive(): Promise<number> {
    return this.orderRepository.count({ where: { isActive: true } });
  }

  async findAllRaw(limit: number, offset: number): Promise<OrderRaw[]> {
    return this.orderRepository.query<OrderRaw[]>(
      `
          SELECT
            o.id, o.code,
            o.order_total AS "orderTotal",
            o.payment_status AS "paymentStatus",
            o.order_status AS "orderStatus",
            o.created_at AS "createdAt",
            o.updated_at AS "updatedAt",
          CASE WHEN c.id IS NOT NULL THEN
            json_build_object(
              'id', c.id,
              'firstName', c.first_name,
              'lastName', c.last_name
            )
          END AS customer
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.id
          WHERE o.is_active = true
          ORDER BY COALESCE(o.updated_at, o.created_at) DESC
          LIMIT $1 OFFSET $2
        `,
      [limit, offset],
    );
  }

  findOneActive(id: string, tx?: EntityManager): Promise<Order | null> {
    const repo = tx ? tx.getRepository(Order) : this.orderRepository;
    return repo.findOne({ where: { id, isActive: true } });
  }

  findOneActiveWithRelations(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id, isActive: true },
      relations: { items: true, customer: true },
    });
  }

  findCartForOrderCreation(
    cartId: string,
    tx: EntityManager,
  ): Promise<Cart | null> {
    return tx
      .getRepository(Cart)
      .createQueryBuilder('cart')
      .leftJoin('cart.items', 'item', 'item.isActive = :isActive', {
        isActive: true,
      })
      .leftJoin('item.variant', 'variant')
      .leftJoin('variant.product', 'product')
      .leftJoinAndSelect('variant.attributes', 'attributes')
      .leftJoinAndSelect('attributes.productAttribute', 'productAttribute')
      .where('cart.id = :cartId', { cartId })
      .andWhere('cart.status = :status', { status: CartStatus.ACTIVE })
      .select([
        'cart.id',
        'cart.customerId',
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
  }

  async getNextSequence(tx: EntityManager): Promise<number> {
    const [{ nextval }] = await tx.query<{ nextval: string }[]>(
      `SELECT nextval('order_sequence')`,
    );

    return Number(nextval);
  }

  async findLastRevisionByCartId(
    cartId: string,
    tx: EntityManager,
  ): Promise<number | null> {
    const order = await tx.getRepository(Order).findOne({
      where: { cartId },
      order: { revision: 'DESC' },
      select: ['revision'],
    });

    return order?.revision ?? null;
  }

  save(data: DeepPartial<Order>, tx: EntityManager): Promise<Order> {
    return tx.save(Order, data);
  }

  async update(
    id: string,
    data: OrderUpdateEntityInput,
    tx: EntityManager,
  ): Promise<boolean> {
    const result = await tx.getRepository(Order).update(id, data);
    return (result.affected ?? 0) > 0;
  }
}
