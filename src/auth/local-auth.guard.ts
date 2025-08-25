import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest<TUser = any>(err: any, user: TUser | null): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Email/Phone or Password is invalid');
    }
    return user;
  }
}
