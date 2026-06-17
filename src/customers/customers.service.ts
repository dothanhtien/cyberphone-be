import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  CreateCustomerDto,
  CustomerCreateEntityInput,
  CustomerResponseDto,
  CustomerUpdateEntityInput,
  UpdateCustomerDto,
} from './dto';
import { CustomerMapper } from './mappers';
import { CUSTOMER_REPOSITORY, type ICustomerRepository } from './repositories';
import { PaginationQueryDto } from '@/common/dto';
import { PaginatedEntity } from '@/common/types';
import {
  extractPaginationParams,
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

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<CustomerResponseDto>> {
    const { page, limit } = extractPaginationParams(paginationQueryDto);
    this.logger.debug(
      `[findAll] Fetching customers page=${page}, limit=${limit}`,
    );

    const result = await this.customerRepository.findAllActive(page, limit);

    this.logger.debug(`[findAll] Fetched ${result.items.length} customers`);

    return {
      ...result,
      items: result.items.map((c) => CustomerMapper.mapToCustomerResponse(c)),
    };
  }

  async findOne(id: string): Promise<CustomerResponseDto> {
    this.logger.debug(`[findOne] Fetching customer id=${id}`);

    const customer = await this.customerRepository.findOneActiveById(id);

    if (!customer) {
      this.logger.warn(`[findOne] Customer not found id=${id}`);
      throw new NotFoundException('Customer not found');
    }

    return CustomerMapper.mapToCustomerResponse(customer);
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    tx?: EntityManager,
  ) {
    this.logger.debug(`[update] Updating customer id=${id}`);

    const exists = await this.customerRepository.findOneActiveById(id);
    if (!exists) {
      throw new NotFoundException('Customer not found');
    }

    if (updateCustomerDto.email) {
      const emailTaken =
        await this.customerRepository.existsActiveByEmailExcludingId(
          updateCustomerDto.email,
          id,
        );
      if (emailTaken) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (updateCustomerDto.phone) {
      const phoneTaken =
        await this.customerRepository.existsActiveByPhoneExcludingId(
          updateCustomerDto.phone,
          id,
        );
      if (phoneTaken) {
        throw new BadRequestException('Phone already in use');
      }
    }

    try {
      const result = await this.customerRepository.update(
        id,
        sanitizeEntityInput(CustomerUpdateEntityInput, updateCustomerDto),
        tx,
      );

      if (!result) {
        throw new NotFoundException('Customer not found');
      }

      this.logger.log(`[update] Customer updated successfully id=${id}`);
      return result;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email or phone already in use');
      }

      this.logger.error(
        `[update] Failed to update customer id=${id}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async deactivate(id: string, updatedBy: string) {
    this.logger.debug(`[deactivate] Deactivating customer id=${id}`);

    const exists = await this.customerRepository.findOneActiveById(id);
    if (!exists) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.update(id, { isActive: false, updatedBy });

    this.logger.log(`[deactivate] Customer deactivated id=${id}`);
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
