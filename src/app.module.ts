import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './categories/categories.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MediaModule } from './media/media.module';
import { StorageModule } from './storage/storage.module';
import { BrandsModule } from './brands/brands.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SeedsModule } from './seeds/seeds.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CustomersModule } from './customers/customers.module';
import { IdentitiesModule } from './identities/identities.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CategoriesModule,
    CloudinaryModule,
    MediaModule,
    StorageModule,
    BrandsModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    SeedsModule,
    CartsModule,
    OrdersModule,
    PaymentModule,
    DashboardModule,
    CustomersModule,
    IdentitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
