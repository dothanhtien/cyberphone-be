import { Request } from 'express';
import type { User } from '@/users/entities/user.entity';

export type RequestHasUser = Request & { user: User };
