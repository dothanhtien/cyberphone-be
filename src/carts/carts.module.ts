import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorefrontCartsService } from './storefront/storefront-carts.service';
import { StorefrontCartsController } from './storefront/storefront-carts.controller';
import { Cart, CartItem } from './entities';
import { ProductVariant } from '@/product-variants/entities/product-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, ProductVariant])],
  providers: [StorefrontCartsService],
  controllers: [StorefrontCartsController],
})
export class CartsModule {}
