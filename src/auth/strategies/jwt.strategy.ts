import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUserType } from '../enums';
import { AuthMapper } from '../mappers';
import { AuthUser, JwtPayload } from '../types';
import { getErrorStack } from '@/common/utils';
import { CustomersService } from '@/customers/customers.service';
import { Customer } from '@/customers/entities';
import { User } from '@/users/entities';
import { UsersService } from '@/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const { sub: userId, type, identityId } = payload;

    if (!userId || !type) {
      this.logger.debug(
        `[validate] Missing params userId=${userId}, type=${type}`,
      );

      throw new UnauthorizedException('Invalid token');
    }

    this.logger.debug(
      `[validate] Validating JWT userId=${userId}, type=${type}`,
    );

    try {
      let account: User | Customer | null;

      if (type === AuthUserType.USER) {
        account = await this.usersService.findOneActiveById(userId);
      } else if (type === AuthUserType.CUSTOMER) {
        account = await this.customersService.findOneActiveById(userId);
      } else {
        this.logger.warn(
          `[validate] Unknown type userId=${userId}, type=${type as any}`,
        );
        throw new UnauthorizedException('Invalid token');
      }

      if (!account) {
        this.logger.debug(
          `[validate] Account not found userId=${userId}, type=${type}`,
        );
        throw new UnauthorizedException('Account not found');
      }

      return AuthMapper.mapToAuthUser({ ...account, identityId });
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }

      this.logger.error(
        `[validate] JWT validation failed userId=${userId}`,
        getErrorStack(err),
      );

      throw new UnauthorizedException('Invalid token');
    }
  }
}
