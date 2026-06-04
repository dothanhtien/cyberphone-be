import { Request } from 'express';
import { AuthUserType } from '../enums';
import { UserRole } from '@/users/enums';

export interface AuthUser {
  id: string;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  isActive: boolean;

  roleId?: string;
  roleName?: UserRole;

  identityId: string;
  type: AuthUserType;
}

export type RequestWithUser = Request & { user: AuthUser };

export type JwtPayload = {
  sub: string;
  type: AuthUserType;
  roleId?: string;
  roleName?: string;
  identityId: string;
};

export interface CreateRefreshTokenParams {
  identityId: string;
  tokenHash: string;
  expiresAt: Date;
}
