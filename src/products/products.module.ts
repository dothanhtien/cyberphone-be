import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { BrandsModule } from '@/brands/brands.module';
import { ProductCategory } from './entities/product-category.entity';
import { CategoriesModule } from '@/categories/categories.module';
import { ProductVariant } from '@/product-variants/entities/product-variant.entity';
import { ProductVariantsModule } from '@/product-variants/product-variants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductCategory, ProductVariant]),
    BrandsModule,
    CategoriesModule,
    ProductVariantsModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
