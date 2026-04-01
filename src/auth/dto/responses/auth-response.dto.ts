import { Expose } from 'class-transformer';
import { AuthUserType } from '@/auth/enums';
import { Role } from '@/users/entities';

export class AuthResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: AuthUserType;

  @Expose()
  username: string;

  @Expose()
  email: string | null;

  @Expose()
  phone: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role?: Role;
}
