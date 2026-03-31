import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerCreateEntityInput } from '../dtos';
import { Customer } from '../entities';

export interface ICustomerRepository {
  create(data: CustomerCreateEntityInput): Promise<Customer>;
  existsActiveByUsernameOrPhone(
    username: string,
    phone: string,
  ): Promise<boolean>;
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

  create(data: CustomerCreateEntityInput): Promise<Customer> {
    return this.customerRepository.save(data);
  }

  async existsActiveByUsernameOrPhone(
    username: string,
    phone: string,
  ): Promise<boolean> {
    return this.customerRepository.exists({
      where: [
        { username: username, isActive: true },
        { phone: phone, isActive: true },
      ],
    });
  }

  findOneActiveById(id: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { id, isActive: true } });
  }

  findOneActiveByIdentifier(identifier: string): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: [
        { username: identifier, isActive: true },
        { phone: identifier, isActive: true },
      ],
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.customerRepository.update(id, { lastLogin: new Date() });
  }
}
