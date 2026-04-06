import { Expose } from 'class-transformer';
import { AuthUserType } from '@/auth/enums';
import { Role } from '@/users/entities';

export class AuthResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: AuthUserType;

  @Expose()
  phone: string;

  @Expose()
  email: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role?: Role;
}
