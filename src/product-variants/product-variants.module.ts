import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { Product } from '@/products/entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { VariantAttribute } from './entities/variant-attribute.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, VariantAttribute]),
  ],
  providers: [ProductVariantsService],
  controllers: [ProductVariantsController],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}
