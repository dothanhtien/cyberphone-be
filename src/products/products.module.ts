import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product,
  ProductAttribute,
  ProductCategory,
  ProductImage,
} from './entities';
import { ProductVariant } from '@/product-variants/entities/product-variant.entity';
import { BrandsModule } from '@/brands/brands.module';
import { CategoriesModule } from '@/categories/categories.module';
import { StorageModule } from '@/storage/storage.module';
import { AdminProductsService } from './admin/admin-products.service';
import { AdminProductsController } from './admin/admin-products.controller';
import { StorefrontProductsService } from './storefront/storefront-products.service';
import { StorefrontProductsController } from './storefront/storefront-products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      ProductVariant,
      ProductImage,
      ProductAttribute,
    ]),
    BrandsModule,
    CategoriesModule,
    StorageModule,
  ],
  providers: [AdminProductsService, StorefrontProductsService],
  controllers: [AdminProductsController, StorefrontProductsController],
})
export class ProductsModule {}
