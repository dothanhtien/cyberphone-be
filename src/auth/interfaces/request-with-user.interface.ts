import { Request } from 'express';
import type { User } from 'src/users/entities/user.entity';

export type RequestWithUser = Request & { user: User };
