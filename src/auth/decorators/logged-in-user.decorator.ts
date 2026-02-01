import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * `@LoggedInUser()` parameter decorator.
 *
 * Retrieves the authenticated user from `request.user`, which is populated
 * by Passport (e.g. JWT strategy) after successful authentication.
 *
 * This decorator can return either the full `User` entity or a specific
 * property of the user.
 *
 * @example
 * ```@LoggedInUser()``` → returns the full User object
 *
 * @example
 * ```@LoggedInUser('id')``` → returns the user's id
 *
 * @example
 * ```@LoggedInUser('email')``` → returns the user's email
 *
 * @returns The authenticated user, a selected user property,
 * or `undefined` if the request is not authenticated.
 */

export const LoggedInUser = createParamDecorator<
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
