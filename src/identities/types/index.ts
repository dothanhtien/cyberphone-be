import { AuthProvider, IdentityType } from '../enums';

export interface CreateIdentityParams {
  type: IdentityType;
  value: string;
  provider: AuthProvider;
}
