import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/users/entities/user.entity';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest<TUser = User>(err: unknown, user: TUser, info: unknown): TUser {
    if (err || !user) {
      if (info instanceof Error) {
        if (info.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        if (info.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Token is invalid');
        }
        if (info.name === 'NotBeforeError') {
          throw new UnauthorizedException('Token not active yet');
        }
        throw new UnauthorizedException(info.message);
      }
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
