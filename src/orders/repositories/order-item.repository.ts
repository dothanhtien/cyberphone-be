import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { OrderItem } from '../entities';

export interface IOrderItemRepository {
  save(
    items: DeepPartial<OrderItem>[],
    tx?: EntityManager,
  ): Promise<OrderItem[]>;
}

export const ORDER_ITEM_REPOSITORY = Symbol('IOrderItemRepository');

@Injectable()
export class OrderItemRepository implements IOrderItemRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  save(
    items: DeepPartial<OrderItem>[],
    tx?: EntityManager,
  ): Promise<OrderItem[]> {
    const repository = tx
      ? tx.getRepository(OrderItem)
      : this.orderItemRepository;

    return repository.save(items);
  }
}
