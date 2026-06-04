import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUserType } from '../enums';
import { AuthUser, RequestWithUser } from '../types';
import { UserRole } from '@/users/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) return true;

    const user: AuthUser = context
      .switchToHttp()
      .getRequest<RequestWithUser>().user;

    if (!user) throw new ForbiddenException('Access denied');

    if (
      user.type === AuthUserType.USER &&
      user.roleName === UserRole.SUPER_ADMIN
    ) {
      return true;
    }

    const userRoles: UserRole[] = [];

    if (user.type === AuthUserType.CUSTOMER) {
      userRoles.push(UserRole.CUSTOMER);
    }

    if (user.roleName) {
      userRoles.push(user.roleName);
    }

    if (!requiredRoles.some((role) => userRoles.includes(role))) {
      throw new ForbiddenException(
        `Access denied: required role(s) — ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
