import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { PasswordService } from '@/password/password.service';
import { CustomersService } from '@/customers/customers.service';
import { AuthUser, JwtPayload } from './types';
import { getErrorStack } from '@/common/utils';
import { IdentityService } from './identity.service';
import { AuthMapper } from './mappers';
import { AuthUserType } from './enums';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly identityService: IdentityService,
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<AuthUser | null> {
    this.logger.debug(
      `[validateUser] Validating user identifier=${identifier}`,
    );

    try {
      const identity = await this.identityService.findByIdentifier(identifier);

      if (!identity) {
        this.logger.warn(
          `[validateUser] User not found identifier=${identifier}`,
        );
        return null;
      }

      if (!identity.passwordHash) {
        this.logger.warn(
          `[validateUser] User has no password identifier=${identifier}`,
        );
        return null;
      }

      const isMatch = await this.passwordService.comparePassword(
        password,
        identity.passwordHash,
      );

      if (!isMatch) {
        this.logger.warn(
          `[validateUser] Invalid password identifier=${identifier}`,
        );
        return null;
      }

      this.logger.debug(
        `[validateUser] User validated identifier=${identifier}`,
      );

      return identity;
    } catch (error) {
      this.logger.error(
        `[validateUser] Error validating user identifier=${identifier}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async login(user: AuthUser) {
    this.logger.debug(`[login] Attempt login id=${user.id}, type=${user.type}`);

    try {
      const payload: JwtPayload = {
        sub: user.id,
        type: user.type,
        role: user.role ?? undefined,
      };

      await this.updateLastLogin(user);

      const accessToken = this.jwtService.sign(payload);

      this.logger.debug(`[login] Login success id=${user.id}`);

      return {
        data: AuthMapper.mapToAuthResponse(user),
        accessToken,
      };
    } catch (error) {
      this.logger.error(
        `[login] Login failed id=${user.id}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  private async updateLastLogin(user: AuthUser) {
    try {
      this.logger.debug(
        `[updateLastLogin] Updating last login id=${user.id}, type=${user.type}`,
      );

      if (user.type === AuthUserType.USER) {
        await this.usersService.updateLastLogin(user.id);
      } else {
        await this.customersService.updateLastLogin(user.id);
      }
    } catch (error) {
      this.logger.warn(
        `[updateLastLogin] Failed to update last login id=${user.id}`,
        getErrorStack(error),
      );
    }
  }
}
