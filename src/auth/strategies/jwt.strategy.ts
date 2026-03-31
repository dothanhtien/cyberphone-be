import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IdentityService } from '../identity.service';
import { AuthUser, JwtPayload } from '../types';
import { getErrorStack } from '@/common/utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    configService: ConfigService,
    private readonly identityService: IdentityService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const { sub: userId, type } = payload;
    this.logger.debug(
      `[validate] Validating JWT userId=${userId}, type=${type}`,
    );

    try {
      const user = await this.identityService.findById(userId, type);

      if (!user) {
        this.logger.debug(
          `[validate] User not found userId=${userId}, type=${type}`,
        );
        throw new UnauthorizedException('User not found');
      }

      return user;
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
