import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  phone: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;
}
