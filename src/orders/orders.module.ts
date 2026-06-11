import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminOrdersController } from './admin/admin-orders.controller';
import { AdminOrdersService } from './admin/admin-orders.service';
import { CustomerOrdersController } from './customer/customer-orders.controller';
import { CustomerOrdersService } from './customer/customer-orders.service';
import { Order, OrderItem } from './entities';
import {
  ORDER_ITEM_REPOSITORY,
  OrderItemRepository,
  ORDER_REPOSITORY,
  OrderRepository,
} from './repositories';
import { StorefrontOrdersController } from './storefront/storefront-orders.controller';
import { StorefrontOrdersService } from './storefront/storefront-orders.service';
import { ProductsModule } from '@/products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), ProductsModule],
  providers: [
    AdminOrdersService,
    CustomerOrdersService,
    StorefrontOrdersService,
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
    {
      provide: ORDER_ITEM_REPOSITORY,
      useClass: OrderItemRepository,
    },
  ],
  controllers: [
    AdminOrdersController,
    CustomerOrdersController,
    StorefrontOrdersController,
  ],
  exports: [AdminOrdersService],
})
export class OrdersModule {}
