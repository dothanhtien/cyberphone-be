import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MomoStrategy } from './strategies/momo.strategy';
import { Cart } from '@/carts/entities';
import { Order } from '@/orders/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Payment, Cart])],
  providers: [PaymentService, MomoStrategy],
  controllers: [PaymentController],
})
export class PaymentModule {}
