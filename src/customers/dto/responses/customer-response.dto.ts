import { Expose } from 'class-transformer';
import { Gender } from '@/common/enums';

export class CustomerResponseDto {
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

  @Expose()
  dateOfBirth: string | null;

  @Expose()
  gender: Gender | null;

  @Expose()
  lastLogin: Date | null;

  @Expose()
  emailVerified: boolean;

  @Expose()
  phoneVerified: boolean;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;
}
