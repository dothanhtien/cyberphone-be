import { Expose } from 'class-transformer';

export class UserCreateEntityDto {
  @Expose()
  email: string;

  @Expose()
  phone?: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  lastLogin?: Date | null;

  @Expose()
  roleId: string;

  @Expose()
  createdBy: string;
}
