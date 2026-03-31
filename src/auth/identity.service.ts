import { Injectable, Logger } from '@nestjs/common';
import { AuthUserType } from './enums';
import { AuthMapper } from './mappers';
import { AuthUser } from './types';
import { CustomersService } from '@/customers/customers.service';
import { UsersService } from '@/users/users.service';
import { getErrorStack } from '@/common/utils';

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
  ) {}

  async findByIdentifier(identifier: string): Promise<AuthUser | null> {
    this.logger.debug(
      `[findByIdentifier] Searching identity identifier=${identifier}`,
    );

    try {
      const user =
        await this.usersService.findOneActiveByIdentifier(identifier);
      if (user) {
        this.logger.debug(
          `[findByIdentifier] Found user identifier=${identifier}`,
        );
        return AuthMapper.mapToAuthUser(user);
      }

      const customer =
        await this.customersService.findOneActiveByIdentifier(identifier);
      if (customer) {
        this.logger.debug(
          `[findByIdentifier] Found customer identifier=${identifier}`,
        );
        return AuthMapper.mapToAuthUser(customer);
      }

      this.logger.debug(
        `[findByIdentifier] Identity not found identifier=${identifier}`,
      );

      return null;
    } catch (error) {
      this.logger.error(
        `[findByIdentifier] Failed to fetch identity identifier=${identifier}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async findById(id: string, type: AuthUserType): Promise<AuthUser | null> {
    this.logger.debug(`[findById] Fetching identity id=${id}, type=${type}`);

    try {
      if (type === AuthUserType.USER) {
        const user = await this.usersService.findOneActiveById(id);

        if (!user) {
          this.logger.debug(`[findById] User not found id=${id}`);
          return null;
        }

        this.logger.debug(`[findById] Found user id=${id}`);

        return AuthMapper.mapToAuthUser(user);
      }

      const customer = await this.customersService.findOneActiveById(id);

      if (!customer) {
        this.logger.debug(`[findById] Customer not found id=${id}`);
        return null;
      }

      this.logger.debug(`[findById] Found customer id=${id}`);

      return AuthMapper.mapToAuthUser(customer);
    } catch (error) {
      this.logger.error(
        `[findById] Failed to fetch entity id=${id}, type=${type}`,
        getErrorStack(error),
      );
      throw error;
    }
  }
}
