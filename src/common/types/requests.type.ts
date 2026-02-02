import { Request } from 'express';
import type { User } from '@/users/entities/user.entity';

export type RequestWithUser = Request & { user: User };

export interface JwtPayload {
  sub: string;
}
