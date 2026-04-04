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
import { PasswordService } from '@/password/password.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, tx: EntityManager) {
    const maskedUsername = maskIdentifier(createCustomerDto.username);
    const maskedPhone = maskIdentifier(createCustomerDto.phone);

    this.logger.debug(
      `[create] Creating customer username=${maskedUsername}, phone=${maskedPhone}`,
    );

    createCustomerDto.username = createCustomerDto.username.toLowerCase();

    try {
      const exists =
        await this.customerRepository.existsActiveByUsernameOrPhone(
          createCustomerDto.username,
          createCustomerDto.phone,
          tx,
        );

      if (exists) {
        this.logger.warn(
          `[create] Username or Phone already in use username=${maskedUsername}, phone=${maskedPhone}`,
        );
        throw new ConflictException('Username or Phone already in use');
      }

      const entity = sanitizeEntityInput(
        CustomerCreateEntityInput,
        createCustomerDto,
      );

      entity.passwordHash = await this.passwordService.hashPassword(
        createCustomerDto.password,
      );

      const customer = await this.customerRepository.create(entity, tx);

      this.logger.log(
        `[create] Customer created successfully id=${customer.id}, username=${maskedUsername}, phone=${maskedPhone}`,
      );

      return customer;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Username or Phone already in use');
      }

      this.logger.error(
        `[create] Failed to create customer username=${maskedUsername}, phone=${maskedPhone}`,
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

  async findActiveByPhoneOrEmail({
    phone,
    email,
    tx,
  }: {
    phone: string;
    email?: string;
    tx: EntityManager;
  }) {
    const maskedPhone = maskIdentifier(phone);
    const maskedEmail = email ? maskIdentifier(email) : undefined;

    this.logger.debug(
      `[findActiveByPhoneOrEmail] Finding phone=${maskedPhone}, email=${maskedEmail}`,
    );

    try {
      const customers = await this.customerRepository.findActiveByPhoneOrEmail({
        phone,
        email,
        tx,
      });

      this.logger.debug(
        `[findActiveByPhoneOrEmail] Fetched success phone=${maskedPhone}, email=${maskedEmail}, count=${customers.length}`,
      );

      return customers;
    } catch (error) {
      this.logger.error(
        `[findActiveByPhoneOrEmail] Failed to fetch phone=${maskedPhone}, email=${maskedEmail}`,
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
