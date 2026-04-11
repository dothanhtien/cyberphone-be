import { Expose } from 'class-transformer';

export class CartCreateEntityInput {
  @Expose()
  customerId?: string;

  @Expose()
  sessionId: string;

  @Expose()
  expiresAt: Date;

  @Expose()
  createdBy: string;
}
