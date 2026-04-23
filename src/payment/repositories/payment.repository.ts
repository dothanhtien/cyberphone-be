import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PaymentCreateEntityInput, PaymentUpdateEntityInput } from '../dto';
import { Payment } from '../entities';

export interface IPaymentRepository {
  create(data: PaymentCreateEntityInput, tx?: EntityManager): Promise<Payment>;
  findByIdWithLock(id: string, tx: EntityManager): Promise<Payment | null>;
  update(
    id: string,
    data: PaymentUpdateEntityInput,
    tx: EntityManager,
  ): Promise<Payment>;
}

export const PAYMENT_REPOSITORY = Symbol('IPaymentRepository');

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
  ) {}

  create(data: PaymentCreateEntityInput, tx?: EntityManager): Promise<Payment> {
    const repo = tx ? tx.getRepository(Payment) : this.repository;
    return repo.save(data);
  }

  findByIdWithLock(id: string, tx: EntityManager): Promise<Payment | null> {
    return tx.getRepository(Payment).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  update(
    id: string,
    data: PaymentUpdateEntityInput,
    tx: EntityManager,
  ): Promise<Payment> {
    return tx.save(Payment, { id, ...data });
  }
}
