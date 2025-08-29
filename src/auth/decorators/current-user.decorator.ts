import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * @CurrentUser() custom decorator
 *
 * Extracts the authenticated user (from request.user) that Passport's JWT strategy
 * attaches after successful validation
 *
 * Usage:
 *   - @CurrentUser() => injects the full User object
 *   - @CurrentUser('id') => injects only the id field
 */
export const CurrentUser = createParamDecorator<
  keyof User | undefined,
  User | User[keyof User] | undefined
>((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  const { user } = request;

  if (!user) return undefined;

  if (data) {
    return user[data];
  }

  return user;
});
