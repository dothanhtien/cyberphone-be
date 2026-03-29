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
    const exists = await this.customerRepository.existsByUsernameOrPhone(
      createCustomerDto.username,
      createCustomerDto.phone,
    );

    if (exists) {
      this.logger.warn(
        `[create] Username or Phone already in use username=${createCustomerDto.username}, phone=${createCustomerDto.phone}`,
      );
      throw new ConflictException('Username or Phone already in use');
    }

    this.logger.log(
      `[create] creating customer username=${createCustomerDto.username}, phone=${createCustomerDto.phone}`,
    );

    const entity = sanitizeEntityInput(
      CustomerCreateEntityInput,
      createCustomerDto,
    );

    entity.passwordHash = await this.passwordService.hashPassword(
      createCustomerDto.password,
    );

    try {
      const customer = await this.customerRepository.create(entity);

      this.logger.log(
        `[create] Customer created successfully username=${createCustomerDto.username}, phone=${createCustomerDto.phone}, id=${customer.id}`,
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
}
