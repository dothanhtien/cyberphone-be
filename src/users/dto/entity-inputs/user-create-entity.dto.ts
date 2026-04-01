import { Expose } from 'class-transformer';

export class UserCreateEntityDto {
  @Expose()
  username: string;

  @Expose()
  phone: string;

  @Expose()
  passwordHash: string;

  @Expose()
  email?: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  lastLogin?: Date;

  @Expose()
  roleId: string;

  @Expose()
  createdBy: string;
}
