import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorefrontCartsService } from './storefront/storefront-carts.service';
import { StorefrontCartsController } from './storefront/storefront-carts.controller';
import { Cart } from './entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart])],
  providers: [StorefrontCartsService],
  controllers: [StorefrontCartsController],
})
export class CartsModule {}
