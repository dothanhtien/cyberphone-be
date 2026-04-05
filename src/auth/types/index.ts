import { Request } from 'express';
import { AuthUserType } from '../enums';

export interface AuthUser {
  id: string;
  type: AuthUserType;

  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;

  roleId?: string;

  isActive: boolean;
}

export type RequestWithUser = Request & { user: AuthUser };

export type JwtPayload = {
  sub: string;
  type: AuthUserType;
  roleId?: string;
};
