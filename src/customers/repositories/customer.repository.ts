import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { CustomerCreateEntityInput, CustomerUpdateEntityInput } from '../dto';
import { Customer } from '../entities';
import { PaginatedEntity } from '@/common/types';
import { buildPaginationParams } from '@/common/utils';

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
  findAllActive(
    page: number,
    limit: number,
  ): Promise<PaginatedEntity<Customer>>;
  update(
    id: string,
    data: CustomerUpdateEntityInput,
  ): Promise<{ id: string } | null>;
  existsActiveByEmailExcludingId(
    email: string,
    excludeId: string,
  ): Promise<boolean>;
  existsActiveByPhoneExcludingId(
    phone: string,
    excludeId: string,
  ): Promise<boolean>;
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

  async findAllActive(
    page: number,
    limit: number,
  ): Promise<PaginatedEntity<Customer>> {
    const [items, totalCount] = await this.customerRepository.findAndCount({
      where: { isActive: true },
      ...buildPaginationParams(page, limit),
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async update(
    id: string,
    data: CustomerUpdateEntityInput,
  ): Promise<{ id: string } | null> {
    const result = await this.customerRepository.update(
      { id, isActive: true },
      data,
    );
    if (result.affected === 0) return null;
    return { id };
  }

  existsActiveByEmailExcludingId(
    email: string,
    excludeId: string,
  ): Promise<boolean> {
    return this.customerRepository.exists({
      where: { email, isActive: true, id: Not(excludeId) },
    });
  }

  existsActiveByPhoneExcludingId(
    phone: string,
    excludeId: string,
  ): Promise<boolean> {
    return this.customerRepository.exists({
      where: { phone, isActive: true, id: Not(excludeId) },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.customerRepository.update(id, { lastLogin: new Date() });
  }
}
