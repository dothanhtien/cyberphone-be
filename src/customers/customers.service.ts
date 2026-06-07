import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateCustomerDto, CustomerCreateEntityInput } from './dtos';
import { CUSTOMER_REPOSITORY, type ICustomerRepository } from './repositories';
import {
  getErrorStack,
  isUniqueConstraintError,
  maskIdentifier,
  sanitizeEntityInput,
} from '@/common/utils';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, tx: EntityManager) {
    const { phone, email } = createCustomerDto;

    const maskedEmail = maskIdentifier(email);
    const maskedPhone = phone ? maskIdentifier(phone) : undefined;

    this.logger.debug(
      `[create] Creating customer email=${maskedEmail}, phone=${maskedPhone}`,
    );

    try {
      const entity = sanitizeEntityInput(
        CustomerCreateEntityInput,
        createCustomerDto,
      );

      const customer = await this.customerRepository.create(entity, tx);

      this.logger.log(
        `[create] Customer created successfully id=${customer.id}, email=${maskedEmail}, phone=${maskedPhone}`,
      );

      return customer;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email or phone already in use');
      }

      this.logger.error(
        `[create] Failed to create customer email=${maskedEmail}, phone=${maskedPhone}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async findOneActiveByIdentifier(identifier: string) {
    const maskedIdentifier = maskIdentifier(identifier);

    try {
      const customer =
        await this.customerRepository.findOneActiveByIdentifier(identifier);

      if (!customer) {
        this.logger.debug(
          `[findOneActiveByIdentifier] Customer not found identifier=${maskedIdentifier}`,
        );
        return null;
      }

      this.logger.debug(
        `[findOneActiveByIdentifier] Customer found id=${customer.id}`,
      );

      return customer;
    } catch (error) {
      this.logger.error(
        `[findOneActiveByIdentifier] Error fetching customer identifier=${maskedIdentifier}`,
        getErrorStack(error),
      );

      throw error;
    }
  }

  async findOneActiveById(id: string) {
    try {
      const customer = await this.customerRepository.findOneActiveById(id);

      if (!customer) {
        this.logger.debug(`[findOneActiveById] Customer not found id=${id}`);
        return null;
      }

      this.logger.debug(`[findOneActiveById] Customer found id=${id}`);

      return customer;
    } catch (error) {
      this.logger.error(
        `[findOneActiveById] Error fetching customer id=${id}`,
        getErrorStack(error),
      );

      throw error;
    }
  }

  async findActiveByEmailOrPhone({
    email,
    phone,
    tx,
  }: {
    email: string;
    phone?: string;
    tx: EntityManager;
  }) {
    const maskedEmail = maskIdentifier(email);
    const maskedPhone = phone ? maskIdentifier(phone) : undefined;

    this.logger.debug(
      `[findActiveByEmailOrPhone] Finding email=${maskedEmail}, phone=${maskedPhone}`,
    );

    try {
      const customers = await this.customerRepository.findActiveByEmailOrPhone({
        email,
        phone,
        tx,
      });

      this.logger.debug(
        `[findActiveByEmailOrPhone] Fetched success email=${maskedEmail}, phone=${maskedPhone}, count=${customers.length}`,
      );

      return customers;
    } catch (error) {
      this.logger.error(
        `[findActiveByEmailOrPhone] Failed to fetch email=${maskedEmail}, phone=${maskedPhone}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async updateLastLogin(id: string) {
    try {
      await this.customerRepository.updateLastLogin(id);

      this.logger.debug(
        `[updateLastLogin] Last login updated successfully id=${id}`,
      );
    } catch (error) {
      this.logger.error(
        `[updateLastLogin] Failed to update last login id=${id}`,
        getErrorStack(error),
      );

      throw error;
    }
  }
}
