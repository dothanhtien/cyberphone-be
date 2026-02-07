import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './categories/categories.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MediaAssetsModule } from './media-assets/media-assets.module';
import { StorageModule } from './storage/storage.module';
import { BrandsModule } from './brands/brands.module';
import { UsersModule } from './users/users.module';
import { PasswordModule } from './password/password.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CategoriesModule,
    CloudinaryModule,
    MediaAssetsModule,
    StorageModule,
    BrandsModule,
    UsersModule,
    PasswordModule,
    AuthModule,
    ProductsModule,
    ProductVariantsModule,
  ],
})
export class AppModule {}
