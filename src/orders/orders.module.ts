import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminOrdersService } from './admin/admin-orders.service';
import { Order, OrderItem } from './entities';
import { StorefrontOrdersController } from './storefront/storefront-orders.controller';
import { StorefrontOrdersService } from './storefront/storefront-orders.service';
import { AdminOrdersController } from './admin/admin-orders.controller';
import { ORDER_REPOSITORY, OrderRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  providers: [
    AdminOrdersService,
    StorefrontOrdersService,
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
  ],
  controllers: [AdminOrdersController, StorefrontOrdersController],
})
export class OrdersModule {}
