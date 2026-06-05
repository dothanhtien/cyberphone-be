import { AuthProvider } from '../enums';

export interface CreateIdentityParams {
  email: string;
  phone?: string;
  passwordHash: string;
  provider: AuthProvider;
  customerId?: string;
  userId?: string;
}
