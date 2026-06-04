import { Expose } from 'class-transformer';
import { CartStatus } from '@/carts/enums';

export class CartUpdateEntityDto {
  @Expose()
  status?: CartStatus;

  @Expose()
  updatedBy: string;
}
