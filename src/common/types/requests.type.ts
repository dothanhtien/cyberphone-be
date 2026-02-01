import { User } from '@/users/entities/user.entity';

export type RequestWithUser = Express.Request & User;
