import { Expose } from 'class-transformer';

export class UserUpdateEntityDto {
  @Expose()
  email?: string;

  @Expose()
  phone?: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  lastLogin?: Date | null;

  @Expose()
  roleId?: string;

  @Expose()
  updatedBy: string;
}
