import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { BrandsModule } from '@/brands/brands.module';
import { ProductCategory } from './entities/product-category.entity';
import { CategoriesModule } from '@/categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductCategory]),
    BrandsModule,
    CategoriesModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
