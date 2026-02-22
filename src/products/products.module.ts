import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from '@/product-variants/entities/product-variant.entity';
import { BrandsModule } from '@/brands/brands.module';
import { CategoriesModule } from '@/categories/categories.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      ProductVariant,
      ProductImage,
    ]),
    BrandsModule,
    CategoriesModule,
    StorageModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
