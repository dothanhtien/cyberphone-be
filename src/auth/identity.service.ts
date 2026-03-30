import { Injectable, Logger } from '@nestjs/common';
import { AuthUserType } from './enums';
import { AuthMapper } from './mappers';
import { AuthUser } from './types';
import { CustomersService } from '@/customers/customers.service';
import { UsersService } from '@/users/users.service';
import { getErrorStack } from '@/common/utils';

@Injectable()
export class IdentityService {
  private readonly logger = new Logger();

  constructor(
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
  ) {}

  async findByIdentifier(identifier: string): Promise<AuthUser | null> {
    this.logger.debug(
      `[findByIdentifier] Searching identity identifier=${identifier}`,
    );

    try {
      const user = await this.usersService.findOneByEmailOrPhone(identifier);
      if (user) {
        this.logger.log(
          `[findByIdentifier] Found user identifier=${identifier}`,
        );
        return AuthMapper.mapToAuthUser(user);
      }

      const customer =
        await this.customersService.findOneByEmailOrPhone(identifier);
      if (customer) {
        this.logger.log(
          `[findByIdentifier] Found customer identifier=${identifier}`,
        );
        return AuthMapper.mapToAuthUser(customer);
      }

      this.logger.warn(
        `[findByIdentifier] Identity not found identifier=${identifier}`,
      );

      return null;
    } catch (error) {
      this.logger.error(
        `[findByIdentifier] Failed to find identity identifier=${identifier}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async findById(id: string, type: AuthUserType): Promise<AuthUser | null> {
    this.logger.debug(`[findById] Fetching identity id=${id}, type=${type}`);

    try {
      if (type === AuthUserType.USER) {
        const user = await this.usersService.findOne(id);

        if (!user) {
          this.logger.warn(`[findById] User not found id=${id}`);
          return null;
        }

        this.logger.log(`[findById] Found user id=${id}`);

        return AuthMapper.mapToAuthUser(user);
      }

      const customer = await this.customersService.findOne(id);

      if (!customer) {
        this.logger.warn(`[findById] Customer not found id=${id}`);
        return null;
      }

      this.logger.log(`[findById] Found customer id=${id}`);

      return AuthMapper.mapToAuthUser(customer);
    } catch (error) {
      this.logger.error(
        `[findById] Failed to find entity id=${id}, type=${type}`,
        getErrorStack(error),
      );
      throw error;
    }
  }
}
