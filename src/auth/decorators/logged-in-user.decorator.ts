import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../types';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * `@LoggedInUser()` parameter decorator.
 *
 * Retrieves the authenticated user from `request.user`, which is populated
 * by Passport (e.g. JWT strategy) after successful authentication.
 *
 * This decorator can return either the full `AuthUser` or a specific property of the AuthUser.
 *
 * @example
 * ```@LoggedInUser()``` → returns the full AuthUser object
 *
 * @example
 * ```@LoggedInUser('id')``` → returns the AuthUser's id
 *
 * @example
 * ```@LoggedInUser('email')``` → returns the AuthUser's email
 *
 * @returns The authenticated user, a selected user property,
 * or `undefined` if the request is not authenticated.
 */

export const LoggedInUser = createParamDecorator<keyof AuthUser | undefined>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;

    if (!user) return undefined;

    if (data) {
      return user[data];
    }

    return user;
  },
);
