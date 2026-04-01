import { Injectable, Logger } from '@nestjs/common';
import { AuthUserType } from './enums';
import { AuthMapper } from './mappers';
import { AuthUser } from './types';
import { CustomersService } from '@/customers/customers.service';
import { UsersService } from '@/users/users.service';
import { getErrorStack, maskIdentifier } from '@/common/utils';

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
  ) {}

  async findByIdentifier(identifier: string): Promise<AuthUser | null> {
    const maskedIdentifier = maskIdentifier(identifier);

    this.logger.debug(
      `[findByIdentifier] Searching identity identifier=${maskedIdentifier}`,
    );

    try {
      const user =
        await this.usersService.findOneActiveByIdentifier(identifier);
      if (user) {
        this.logger.debug(
          `[findByIdentifier] Found user identifier=${maskedIdentifier}`,
        );
        return AuthMapper.mapToAuthUser(user);
      }

      const customer =
        await this.customersService.findOneActiveByIdentifier(identifier);
      if (customer) {
        this.logger.debug(
          `[findByIdentifier] Found customer identifier=${maskedIdentifier}`,
        );
        return AuthMapper.mapToAuthUser(customer);
      }

      this.logger.debug(
        `[findByIdentifier] Identity not found identifier=${maskedIdentifier}`,
      );

      return null;
    } catch (error) {
      this.logger.error(
        `[findByIdentifier] Failed to fetch identity identifier=${maskedIdentifier}`,
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

      if (type !== AuthUserType.CUSTOMER) {
        this.logger.debug(`[findById] Unsupported auth type`);
        return null;
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
