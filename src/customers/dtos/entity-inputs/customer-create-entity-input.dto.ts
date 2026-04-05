import { Expose } from 'class-transformer';
import { Gender } from '@/customers/enums';

export class CustomerCreateEntityInput {
  @Expose()
  phone: string;

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
