import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { RegisterDto } from './dto';
import { AuthUserType } from './enums';
import { AuthMapper } from './mappers';
import { AuthUser, JwtPayload } from './types';
import { getErrorStack, maskIdentifier } from '@/common/utils';
import { CustomersService } from '@/customers/customers.service';
import { AuthProvider } from '@/identities/enums';
import { IdentitiesService } from '@/identities/identities.service';
import { PasswordService } from '@/password/password.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly identitiesService: IdentitiesService,
    private readonly customersService: CustomersService,
    private readonly passwordService: PasswordService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<AuthUser | null> {
    const maskedIdentifier = maskIdentifier(identifier);

    this.logger.debug(
      `[validateUser] Validating user identifier=${maskedIdentifier}`,
    );

    try {
      const identity = await this.identitiesService.findOne(
        identifier,
        AuthProvider.LOCAL,
      );

      if (!identity) {
        this.logger.debug(
          `[validateUser] Identity not found identifier=${maskedIdentifier}`,
        );

        return null;
      }

      const account = identity.user ?? identity.customer;

      if (!account) {
        this.logger.error(
          `[validateUser] Identity has no owner id=${identity.id}`,
        );

        return null;
      }

      if (!identity.passwordHash) {
        this.logger.debug(
          `[validateUser] User has no password identifier=${maskedIdentifier}`,
        );

        return null;
      }

      const isMatch = await this.passwordService.comparePassword(
        password,
        identity.passwordHash,
      );

      if (!isMatch) {
        this.logger.debug(
          `[validateUser] Invalid password identifier=${maskedIdentifier}`,
        );

        return null;
      }

      this.logger.debug(
        `[validateUser] Validate successful identifier=${maskedIdentifier}`,
      );

      return AuthMapper.mapToAuthUser(account);
    } catch (error) {
      this.logger.error(
        `[validateUser] Error validating user identifier=${maskedIdentifier}`,
        getErrorStack(error),
      );

      throw error;
    }
  }

  async login(user: AuthUser) {
    this.logger.debug(
      `[login] Attemptinng login id=${user.id}, type=${user.type}`,
    );

    const payload: JwtPayload = {
      sub: user.id,
      type: user.type,
      roleId: user.roleId,
    };

    try {
      const accessToken = this.jwtService.sign(payload);

      await this.updateLastLogin(user);

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

      this.logger.debug(
        `[updateLastLogin] Update last loggin success id=${user.id}`,
      );
    } catch (error) {
      this.logger.warn(
        `[updateLastLogin] Failed to update last login id=${user.id}`,
        getErrorStack(error),
      );
    }
  }

  async register(registerDto: RegisterDto) {
    const { phone, email, password } = registerDto;

    const maskedPhone = maskIdentifier(phone);
    const maskedEmail = email ? maskIdentifier(email) : undefined;

    this.logger.debug(
      `[register] Registering phone=${maskedPhone}, email=${maskedEmail}`,
    );

    try {
      const result = await this.dataSource.transaction(async (tx) => {
        const identifiers = [phone, ...(email ? [email] : [])];

        this.logger.debug(`[register] Checking existing identities`);

        const existed = await this.identitiesService.existsByValues({
          values: identifiers,
          tx,
        });

        if (existed) {
          throw new ConflictException('Phone or email already exists');
        }

        this.logger.debug(`[register] Resolving customer`);

        const customers = await this.customersService.findActiveByPhoneOrEmail({
          phone,
          email,
          tx,
        });

        if (customers.length > 1) {
          this.logger.warn(
            `[register] Conflict: phone and email belong to different customers`,
          );

          throw new ConflictException(
            'Phone and email belong to different accounts',
          );
        }

        let customer = customers[0];

        if (!customer) {
          customer = await this.customersService.create(registerDto, tx);
        }

        const passwordHash = await this.passwordService.hashPassword(password);

        this.logger.debug(`[register] Creating identities`);

        await this.identitiesService.create(
          {
            phone,
            email,
            passwordHash,
            provider: AuthProvider.LOCAL,
            customerId: customer.id,
          },
          tx,
        );

        return { id: customer.id };
      });

      this.logger.log(`[register] Success customerId=${result.id}`);

      return result;
    } catch (error) {
      this.logger.error(
        `[register] Failed phone=${maskedPhone}, email=${maskedEmail}`,
        getErrorStack(error),
      );

      throw error;
    }
  }
}
