import { Expose } from 'class-transformer';
import { Gender } from '@/customers/enums';

export class CustomerCreateEntityInput {
  @Expose()
  username: string;

  @Expose()
  phone: string;

  @Expose()
  passwordHash?: string | null;

  @Expose()
  email?: string | null;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  dateOfBirth?: string | null;

  @Expose()
  gender?: Gender | null;

  @Expose()
  createdBy?: string | null;
}
