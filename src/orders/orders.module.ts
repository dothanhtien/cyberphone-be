import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorefrontOrdersService } from './storefront/storefront-orders.service';
import { StorefrontOrdersController } from './storefront/storefront-orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  providers: [StorefrontOrdersService],
  controllers: [StorefrontOrdersController],
})
export class OrdersModule {}
