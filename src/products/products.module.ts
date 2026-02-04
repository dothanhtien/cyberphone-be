import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { BrandsModule } from '@/brands/brands.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), BrandsModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
