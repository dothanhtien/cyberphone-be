import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem } from './entities';
import { CART_REPOSITORY, CartRepository } from './repositories';
import { StorefrontCartsController } from './storefront/storefront-carts.controller';
import { StorefrontCartsService } from './storefront/storefront-carts.service';
import { ProductVariant } from '@/product-variants/entities/product-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, ProductVariant])],
  providers: [
    StorefrontCartsService,
    {
      provide: CART_REPOSITORY,
      useClass: CartRepository,
    },
  ],
  controllers: [StorefrontCartsController],
})
export class CartsModule {}
