import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { RegisterDto } from './dto';
import { AuthUserType } from './enums';
import { AuthMapper } from './mappers';
import { AuthUser, JwtPayload } from './types';
import { CustomersService } from '@/customers/customers.service';
import { IdentitiesService } from '@/identities/identities.service';
import { PasswordService } from '@/password/password.service';
import { UsersService } from '@/users/users.service';
import { getErrorStack, maskIdentifier } from '@/common/utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly identitiesService: IdentitiesService,
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
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
      const identity = await this.identitiesService.findOneLocal(identifier);

      if (!identity) {
        this.logger.warn(
          `[validateUser] Identity not found identifier=${maskedIdentifier}`,
        );
        return null;
      }

      if (!identity.user && !identity.customer) {
        this.logger.error(
          `[validateUser] Identity has no owner id=${identity.id}`,
        );
        return null;
      }

      if (!identity.passwordHash) {
        this.logger.warn(
          `[validateUser] User has no password identifier=${maskedIdentifier}`,
        );
        return null;
      }

      const isMatch = await this.passwordService.comparePassword(
        password,
        identity.passwordHash,
      );

      if (!isMatch) {
        this.logger.warn(
          `[validateUser] Invalid password identifier=${maskedIdentifier}`,
        );
        return null;
      }

      const account = identity.user ?? identity.customer;

      const authUser = AuthMapper.mapToAuthUser(account!);

      this.logger.debug(
        `[validateUser] Success identifier=${maskedIdentifier}, id=${authUser.id}, type=${authUser.type}`,
      );

      return authUser;
    } catch (error) {
      this.logger.error(
        `[validateUser] Error validating user identifier=${maskedIdentifier}`,
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

  async register(registerDto: RegisterDto) {
    const maskedPhone = maskIdentifier(registerDto.phone);
    const maskedEmail = registerDto.email
      ? maskIdentifier(registerDto.email)
      : undefined;

    this.logger.debug(
      `[register] Start registering phone=${maskedPhone}, email=${maskedEmail}`,
    );

    return await this.dataSource.transaction(async (tx) => {
      if (registerDto.phone) {
        const existingPhoneIdentify =
          await this.identitiesService.existsByValue({
            value: registerDto.phone,
            tx,
          });

        if (existingPhoneIdentify) {
          throw new ConflictException('Phone already exists');
        }
      }

      if (registerDto.email) {
        const existingEmailIdentify =
          await this.identitiesService.existsByValue({
            value: registerDto.email,
            tx,
          });

        if (existingEmailIdentify) {
          throw new ConflictException('Email already exists');
        }
      }

      // const customer = await this.customersService.findOneActiveByIdentifiers()
    });

    // return this.customersService.create(registerDto);
  }
}
