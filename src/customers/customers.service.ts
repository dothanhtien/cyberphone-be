import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { CUSTOMER_REPOSITORY, type ICustomerRepository } from './repositories';
import { CreateCustomerDto, CustomerCreateEntityInput } from './dtos';
import { getErrorStack, sanitizeEntityInput } from '@/common/utils';
import { PasswordService } from '@/password/password.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    this.logger.debug(
      `[create] Creating customer username=${createCustomerDto.username}, phone=${createCustomerDto.phone}`,
    );

    createCustomerDto.username = createCustomerDto.username.toLowerCase();

    try {
      const exists =
        await this.customerRepository.existsActiveByUsernameOrPhone(
          createCustomerDto.username,
          createCustomerDto.phone,
        );

      if (exists) {
        this.logger.warn(
          `[create] Username or Phone already in use username=${createCustomerDto.username}, phone=${createCustomerDto.phone}`,
        );
        throw new ConflictException('Username or Phone already in use');
      }

      const entity = sanitizeEntityInput(
        CustomerCreateEntityInput,
        createCustomerDto,
      );

      this.logger.debug(
        `[create] Hashing password username=${createCustomerDto.username}, phone=${createCustomerDto.phone}`,
      );

      entity.passwordHash = await this.passwordService.hashPassword(
        createCustomerDto.password,
      );

      const customer = await this.customerRepository.create(entity);

      this.logger.log(
        `[create] Customer created successfully id=${customer.id}, username=${createCustomerDto.username}, phone=${createCustomerDto.phone}`,
      );

      return { id: customer.id };
    } catch (error) {
      this.logger.error(
        `[create] Failed to create customer username=${createCustomerDto.username}, phone=${createCustomerDto.phone}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async findOneActiveByIdentifier(identifier: string) {
    try {
      const customer =
        await this.customerRepository.findOneActiveByIdentifier(identifier);

      if (!customer) {
        this.logger.debug(
          `[findOneActiveByIdentifier] Customer not found identifier=${identifier}`,
        );
        return null;
      }

      this.logger.debug(
        `[findOneActiveByIdentifier] Customer found id=${customer.id}`,
      );

      return customer;
    } catch (error) {
      this.logger.error(
        `[findOneActiveByIdentifier] Error fetching customer identifier=${identifier}`,
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
