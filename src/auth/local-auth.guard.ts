import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest<TUser = User>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Email/Phone or Password is invalid');
    }
    return user;
  }
}
