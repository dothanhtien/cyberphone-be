import { Expose } from 'class-transformer';
import { Gender } from '@/common/enums';

export class UserUpdateEntityDto {
  @Expose()
  email?: string;

  @Expose()
  phone?: string | null;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  dateOfBirth?: string | null;

  @Expose()
  gender?: Gender | null;

  @Expose()
  lastLogin?: Date | null;

  @Expose()
  roleId?: string;

  @Expose()
  updatedBy: string;
}
