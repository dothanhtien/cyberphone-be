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
import { AdminProductVariantsController } from './admin/admin-product-variants.controller';
import { AdminProductVariantsService } from './admin/admin-product-variants.service';
import { AdminVariantAttributesService } from './admin/admin-variant-attributes.service';
import {
  Product,
  ProductAttribute,
  ProductCategory,
  ProductImage,
  ProductVariant,
  VariantAttribute,
} from './entities';
import {
  PRODUCT_ATTRIBUTE_REPOSITORY,
  PRODUCT_IMAGE_REPOSITORY,
  PRODUCT_REPOSITORY,
  PRODUCT_VARIANT_REPOSITORY,
  ProductAttributeRepository,
  ProductImageRepository,
  ProductRepository,
  ProductVariantRepository,
  VARIANT_ATTRIBUTE_REPOSITORY,
  VariantAttributeRepository,
} from './repositories';
import { StorefrontProductsController } from './storefront/storefront-products.controller';
import { StorefrontProductsService } from './storefront/storefront-products.service';
import { BrandsModule } from '@/brands/brands.module';
import { CategoriesModule } from '@/categories/categories.module';
import { MediaModule } from '@/media/media.module';
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
    AdminProductAttributesService,
    AdminProductCategoriesService,
    AdminProductImagesService,
    AdminProductImageUploadService,
    AdminProductValidatorsService,
    AdminProductVariantsService,
    AdminVariantAttributesService,
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
    {
      provide: PRODUCT_VARIANT_REPOSITORY,
      useClass: ProductVariantRepository,
    },
    {
      provide: VARIANT_ATTRIBUTE_REPOSITORY,
      useClass: VariantAttributeRepository,
    },
  ],
  controllers: [
    AdminProductsController,
    AdminProductAttributesController,
    AdminProductVariantsController,
    StorefrontProductsController,
  ],
  exports: [AdminProductVariantsService],
})
export class ProductsModule {}
