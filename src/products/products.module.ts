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
import { AdminProductImagesService } from './admin/admin-product-images.service';
import { AdminProductAttributesService } from './admin/admin-product-attributes.service';
import { AdminProductCategoriesService } from './admin/admin-product-categories.service';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
  PRODUCT_ATTRIBUTE_REPOSITORY,
  ProductAttributeRepository,
  PRODUCT_IMAGE_REPOSITORY,
  ProductImageRepository,
} from './admin/repositories';
import { AdminProductValidatorsService } from './admin/admin-product-validators.service';
import { AdminProductImageUploadService } from './admin/admin-product-image-upload.service';
import { MediaModule } from '@/media/media.module';

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
    MediaModule,
  ],
  providers: [
    AdminProductsService,
    AdminProductCategoriesService,
    AdminProductImagesService,
    AdminProductImageUploadService,
    AdminProductAttributesService,
    AdminProductValidatorsService,
    StorefrontProductsService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    {
      provide: PRODUCT_ATTRIBUTE_REPOSITORY,
      useClass: ProductAttributeRepository,
    },
    {
      provide: PRODUCT_IMAGE_REPOSITORY,
      useClass: ProductImageRepository,
    },
  ],
  controllers: [AdminProductsController, StorefrontProductsController],
})
export class ProductsModule {}
