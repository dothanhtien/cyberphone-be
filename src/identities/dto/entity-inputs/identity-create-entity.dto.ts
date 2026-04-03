import { Expose } from 'class-transformer';
import { AuthProvider, IdentityType } from '@/identities/enums';

export class IdentityCreateEntity {
  @Expose()
  type: IdentityType;

  @Expose()
  value: string;

  @Expose()
  provider: AuthProvider;

  @Expose()
  passwordHash: string;
}
