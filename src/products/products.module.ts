import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProductsController } from './admin/admin-products.controller';
import { AdminProductsService } from './admin/admin-products.service';
import { AdminProductAttributesController } from './admin/admin-product-attributes.controller';
import { AdminProductAttributesService } from './admin/admin-product-attributes.service';
import { AdminProductCategoriesService } from './admin/admin-product-categories.service';
import { AdminProductImagesService } from './admin/admin-product-images.service';
import { AdminProductImageUploadService } from './admin/admin-product-image-upload.service';
import { AdminProductValidatorsService } from './admin/admin-product-validators.service';
import { ProductVariantsController } from './admin/product-variants.controller';
import { ProductVariantsService } from './admin/product-variants.service';
import { VariantAttributesService } from './admin/variant-attributes.service';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
  PRODUCT_ATTRIBUTE_REPOSITORY,
  ProductAttributeRepository,
  PRODUCT_IMAGE_REPOSITORY,
  ProductImageRepository,
} from './admin/repositories';
import {
  Product,
  ProductAttribute,
  ProductCategory,
  ProductImage,
  ProductVariant,
  VariantAttribute,
} from './entities';
import { StorefrontProductsController } from './storefront/storefront-products.controller';
import { StorefrontProductsService } from './storefront/storefront-products.service';
import { MediaModule } from '@/media/media.module';
import {
  STOREFRONT_PRODUCT_REPOSITORY,
  StorefrontProductRepository,
} from './storefront/repositories';
import { BrandsModule } from '@/brands/brands.module';
import { CategoriesModule } from '@/categories/categories.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      ProductVariant,
      VariantAttribute,
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
    ProductVariantsService,
    VariantAttributesService,
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
    {
      provide: STOREFRONT_PRODUCT_REPOSITORY,
      useClass: StorefrontProductRepository,
    },
  ],
  controllers: [
    AdminProductsController,
    AdminProductAttributesController,
    ProductVariantsController,
    StorefrontProductsController,
  ],
  exports: [ProductVariantsService],
})
export class ProductsModule {}
