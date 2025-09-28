import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { PasswordModule } from './common/password/password.module';
import { UPLOADS_ROOT } from './common/constants/path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: UPLOADS_ROOT,
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    PasswordModule,
    AuthModule,
    UsersModule,
    BrandsModule,
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
