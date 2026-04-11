import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem } from './entities';
import {
  CART_ITEM_REPOSITORY,
  CART_REPOSITORY,
  CartItemRepository,
  CartRepository,
} from './repositories';
import { StorefrontCartsController } from './storefront/storefront-carts.controller';
import { StorefrontCartsService } from './storefront/storefront-carts.service';
import { ProductVariantsModule } from '@/product-variants/product-variants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), ProductVariantsModule],
  providers: [
    StorefrontCartsService,
    {
      provide: CART_REPOSITORY,
      useClass: CartRepository,
    },
    {
      provide: CART_ITEM_REPOSITORY,
      useClass: CartItemRepository,
    },
  ],
  controllers: [StorefrontCartsController],
})
export class CartsModule {}
