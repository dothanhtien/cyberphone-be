import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { DataSource } from 'typeorm';
import { ForgotPasswordDto, RegisterDto } from './dto';
import { AuthUserType } from './enums';
import { AuthMapper } from './mappers';
import { RefreshTokenService } from './refresh-token.service';
import { AuthUser, JwtPayload } from './types';
import {
  comparePassword,
  hashPassword,
  getErrorStack,
  maskIdentifier,
} from '@/common/utils';
import { CustomersService } from '@/customers/customers.service';
import { EmailService } from '@/email/email.service';
import { AuthProvider } from '@/identities/enums';
import { IdentitiesService } from '@/identities/identities.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly customersService: CustomersService,
    private readonly emailService: EmailService,
    private readonly identitiesService: IdentitiesService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly usersService: UsersService,
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

      const isMatch = await comparePassword(password, identity.passwordHash);

      if (!isMatch) {
        this.logger.debug(
          `[validateUser] Invalid password identifier=${maskedIdentifier}`,
        );

        return null;
      }

      this.logger.debug(
        `[validateUser] Validate successful identifier=${maskedIdentifier}`,
      );

      return AuthMapper.mapToAuthUser({ ...account, identityId: identity.id });
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
      `[login] Attempting login id=${user.id}, type=${user.type}`,
    );

    const payload: JwtPayload = {
      sub: user.id,
      type: user.type,
      roleId: user.roleId,
      roleName: user.roleName,
      identityId: user.identityId,
    };

    try {
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = await this.refreshTokenService.create(
        user.identityId,
      );

      await this.updateLastLogin(user);

      this.logger.debug(`[login] Login success id=${user.id}`);

      return {
        data: AuthMapper.mapToAuthResponse(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(
        `[login] Login failed id=${user.id}`,
        getErrorStack(error),
      );

      throw error;
    }
  }

  async refresh(refreshToken: string) {
    this.logger.debug(`[refresh] Rotating refresh token`);

    try {
      const { authUser, newToken } =
        await this.refreshTokenService.rotate(refreshToken);

      const payload: JwtPayload = {
        sub: authUser.id,
        type: authUser.type,
        roleId: authUser.roleId,
        roleName: authUser.roleName,
        identityId: authUser.identityId,
      };

      const accessToken = this.jwtService.sign(payload);

      this.logger.debug(`[refresh] Token refreshed id=${authUser.id}`);

      return {
        data: AuthMapper.mapToAuthResponse(authUser),
        accessToken,
        refreshToken: newToken,
      };
    } catch (error) {
      this.logger.error(
        `[refresh] Failed to refresh token`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async revoke(userId: string, tokenId: string): Promise<void> {
    this.logger.debug(`[revoke] Revoking token id=${tokenId} userId=${userId}`);

    try {
      await this.refreshTokenService.revoke(userId, tokenId);
      this.logger.debug(`[revoke] Token revoked id=${tokenId}`);
    } catch (error) {
      this.logger.error(
        `[revoke] Failed to revoke token id=${tokenId}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    const maskedEmail = maskIdentifier(email);

    this.logger.debug(`[forgotPassword] Start email=${maskedEmail}`);

    try {
      const identity = await this.identitiesService.findOne(
        email,
        AuthProvider.LOCAL,
      );

      if (!identity || !identity.passwordHash) {
        this.logger.debug(
          `[forgotPassword] Identity not found or has no password email=${maskedEmail}`,
        );
        return;
      }

      const temporaryPassword = `Aa1!${randomBytes(7).toString('hex')}`;
      const passwordHash = await hashPassword(temporaryPassword);

      const userId = identity.userId ?? undefined;
      const customerId = identity.customerId ?? undefined;

      const identityIds = await this.identitiesService.findAllIdsByAccountId({
        userId,
        customerId,
      });

      await this.dataSource.transaction(async (tx) => {
        await this.identitiesService.updatePassword({
          userId,
          customerId,
          passwordHash,
          tx,
        });

        await this.refreshTokenService.revokeAllByIdentityIds(identityIds, tx);
      });

      await this.emailService.sendForgotPassword(email, { temporaryPassword });

      this.logger.log(`[forgotPassword] Success email=${maskedEmail}`);
    } catch (error) {
      this.logger.error(
        `[forgotPassword] Failed email=${maskedEmail}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async register(registerDto: RegisterDto) {
    const { phone, email, password } = registerDto;

    const maskedEmail = maskIdentifier(email);
    const maskedPhone = phone ? maskIdentifier(phone) : undefined;

    this.logger.debug(
      `[register] Registering email=${maskedEmail}, phone=${maskedPhone}`,
    );

    try {
      const result = await this.dataSource.transaction(async (tx) => {
        const identifiers = [email, ...(phone ? [phone] : [])];

        this.logger.debug(`[register] Checking existing identities`);

        const existed = await this.identitiesService.existsByValues({
          values: identifiers,
          tx,
        });

        if (existed) {
          throw new ConflictException('Email or phone already exists');
        }

        this.logger.debug(`[register] Resolving customer`);

        const customers = await this.customersService.findActiveByEmailOrPhone({
          email,
          phone,
          tx,
        });

        if (customers.length > 1) {
          this.logger.warn(
            `[register] Conflict: email and phone belong to different customers`,
          );

          throw new ConflictException(
            'Email and phone belong to different accounts',
          );
        }

        let customer = customers[0];

        if (customer) {
          const matchesEmail = customer.email === email;
          const matchesPhone = !phone || customer.phone === phone;

          if (!matchesEmail || !matchesPhone) {
            throw new ConflictException(
              'Email and phone must match the same existing account',
            );
          }
        } else {
          customer = await this.customersService.create(registerDto, tx);
        }

        const passwordHash = await hashPassword(password);

        this.logger.debug(`[register] Creating identities`);

        await this.identitiesService.create(
          {
            email,
            phone,
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
        `[register] Failed email=${maskedEmail}, phone=${maskedPhone}`,
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
        `[updateLastLogin] Update last login success id=${user.id}`,
      );
    } catch (error) {
      this.logger.warn(
        `[updateLastLogin] Failed to update last login id=${user.id}`,
        getErrorStack(error),
      );
    }
  }
}
