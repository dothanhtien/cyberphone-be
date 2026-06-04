import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Order } from '@/orders/entities';
import { ProductVariant } from '@/products/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Order, ProductVariant])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
