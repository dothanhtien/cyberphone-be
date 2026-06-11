import { IsEnum } from 'class-validator';
import { OrderStatus } from '@/orders/enums';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
