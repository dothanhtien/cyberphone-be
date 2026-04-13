import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderRaw } from '../admin/types';
import { Order } from '../entities';

export interface IOrderRepository {
  countActive(): Promise<number>;
  findAllRaw(limit: number, offset: number): Promise<OrderRaw[]>;
  findOneActive(id: string): Promise<Order | null>;
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

  findOneActive(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id, isActive: true },
      relations: { items: true, customer: true },
    });
  }
}
