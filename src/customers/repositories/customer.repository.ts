import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerCreateEntityInput } from '../dtos';
import { Customer } from '../entities';
import { getErrorStack, isUniqueConstraintError } from '@/common/utils';

export interface ICustomerRepository {
  create(data: CustomerCreateEntityInput): Promise<Customer>;
  existsByUsernameOrPhone(username: string, phone: string): Promise<boolean>;
  findOneByUsernameOrPhone(identifier: string): Promise<Customer | null>;
  findOne(id: string): Promise<Customer | null>;
  updateLastLogin(id: string): Promise<void>;
}

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  private readonly logger = new Logger(CustomerRepository.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(data: CustomerCreateEntityInput): Promise<Customer> {
    try {
      const customer = await this.customerRepository.save(data);

      this.logger.debug(
        `[create] Customer created username=${data.username}, phone=${data.phone}, id=${customer.id}`,
      );

      return customer;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        this.logger.warn(
          `[create] Unique constraint violation on username or phone username=${data.username}, phone=${data.phone}`,
        );

        throw new ConflictException('Username or phone already exists');
      }

      this.logger.error(
        `[create] Failed to create customer username=${data.username}, phone=${data.phone}`,
        getErrorStack(error),
      );

      throw error;
    }
  }

  async existsByUsernameOrPhone(
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

  async findOneByUsernameOrPhone(identifier: string): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: [
        { username: identifier, isActive: true },
        { phone: identifier, isActive: true },
      ],
    });
  }

  async findOne(id: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { id, isActive: true } });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.customerRepository.update(id, { lastLogin: new Date() });
  }
}
