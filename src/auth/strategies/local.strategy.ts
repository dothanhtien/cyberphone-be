import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthUser } from '../types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({ usernameField: 'identifier' });
  }

  async validate(identifier: string, password: string): Promise<AuthUser> {
    this.logger.debug(
      `[validate] Attempting local login identifier=${identifier}`,
    );

    try {
      const user = await this.authService.validateUser(identifier, password);

      if (!user) {
        this.logger.warn(
          `[validate] Invalid credentials identifier=${identifier}`,
        );
        throw new UnauthorizedException(
          'Username/Phone or Password is invalid',
        );
      }

      this.logger.log(
        `[validate] Local login successful identifier=${identifier}`,
      );
      return user;
    } catch (err) {
      this.logger.error(
        `[validate] Local login error identifier=${identifier}`,
        err instanceof Error ? err.stack : `${err}`,
      );
      throw new UnauthorizedException('Invalid login attempt');
    }
  }
}
