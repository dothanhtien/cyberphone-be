import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PAYMENT_REPOSITORY, PaymentRepository } from './repositories';
import { MomoStrategy } from './strategies';
import { CartsModule } from '@/carts/carts.module';
import { OrdersModule } from '@/orders/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), OrdersModule, CartsModule],
  providers: [
    PaymentService,
    MomoStrategy,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
  ],
  controllers: [PaymentController],
})
export class PaymentModule {}
