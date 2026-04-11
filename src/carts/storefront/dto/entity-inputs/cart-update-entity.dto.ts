import { Expose } from 'class-transformer';

export class CartUpdateEntityDto {
  @Expose()
  customerId?: string;

  @Expose()
  expiresAt?: Date;

  @Expose()
  updatedBy?: string;
}
