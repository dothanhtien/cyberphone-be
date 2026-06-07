import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CustomerCreateEntityInput } from '../dtos';
import { Customer } from '../entities';

export interface ICustomerRepository {
  create(data: CustomerCreateEntityInput, tx: EntityManager): Promise<Customer>;
  findActiveByEmailOrPhone({
    email,
    phone,
    tx,
  }: {
    email: string;
    phone?: string;
    tx: EntityManager;
  }): Promise<Customer[]>;
  findOneActiveById(id: string): Promise<Customer | null>;
  findOneActiveByIdentifier(identifier: string): Promise<Customer | null>;
  updateLastLogin(id: string): Promise<void>;
}

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  create(
    data: CustomerCreateEntityInput,
    tx: EntityManager,
  ): Promise<Customer> {
    return tx.getRepository(Customer).save(data);
  }

  findActiveByEmailOrPhone({
    email,
    phone,
    tx,
  }: {
    email: string;
    phone?: string;
    tx: EntityManager;
  }): Promise<Customer[]> {
    const whereOptions: {
      phone?: string;
      email?: string;
      isActive: boolean;
    }[] = [{ email, isActive: true }];

    if (phone) {
      whereOptions.push({ phone, isActive: true });
    }

    return tx.getRepository(Customer).find({ where: whereOptions });
  }

  findOneActiveById(id: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { id, isActive: true } });
  }

  findOneActiveByIdentifier(identifier: string): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: [
        { phone: identifier, isActive: true },
        { email: identifier, isActive: true },
      ],
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.customerRepository.update(id, { lastLogin: new Date() });
  }
}
