import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
