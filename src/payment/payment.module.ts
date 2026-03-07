import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Order } from '@/orders/entities/order.entity';
import { Payment } from './entities/payment.entity';
import { MomoStrategy } from './strategies/momo.strategy';
import { Cart } from '@/carts/entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Payment, Cart])],
  providers: [PaymentService, MomoStrategy],
  controllers: [PaymentController],
})
export class PaymentModule {}
