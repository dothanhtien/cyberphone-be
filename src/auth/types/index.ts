import { Request } from 'express';
import { AuthUserType } from '../enums';
import { Role } from '@/users/entities';

export interface AuthUser {
  id: string;
  type: AuthUserType;

  username: string;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;

  role?: Role;

  isActive: boolean;
  passwordHash: string | null;
}

export type RequestWithUser = Request & { user: AuthUser };

export type JwtPayload = {
  sub: string;
  type: AuthUserType;
  role?: Role;
};
