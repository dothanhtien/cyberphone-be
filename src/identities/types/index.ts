import { AuthProvider } from '../enums';

export interface CreateIdentityParams {
  phone: string;
  email?: string;
  passwordHash: string;
  provider: AuthProvider;
  customerId?: string;
  userId?: string;
}
