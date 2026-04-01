import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  phone: string;

  @Expose()
  email: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;
}
