import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthUser } from '../types';
import { getErrorStack, maskIdentifier } from '@/common/utils';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({ usernameField: 'identifier' });
  }

  async validate(identifier: string, password: string): Promise<AuthUser> {
    const maskedIdentifier = maskIdentifier(identifier);

    this.logger.debug(
      `[validate] Attempting login identifier=${maskedIdentifier}`,
    );

    try {
      const user = await this.authService.validateUser(identifier, password);

      if (!user) {
        this.logger.debug(
          `[validate] Invalid credentials identifier=${maskedIdentifier}`,
        );
        throw new UnauthorizedException(
          'Username/Phone or Password is invalid',
        );
      }

      this.logger.log(
        `[validate] Login successful identifier=${maskedIdentifier}`,
      );
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `[validate] Login error identifier=${maskedIdentifier}`,
        getErrorStack(error),
      );

      throw new UnauthorizedException('Invalid login attempt');
    }
  }
}
