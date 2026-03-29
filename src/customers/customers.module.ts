import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer } from './entities';
import { CUSTOMER_REPOSITORY, CustomerRepository } from './repositories';
import { PasswordModule } from '@/password/password.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), PasswordModule],
  providers: [
    CustomersService,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepository,
    },
  ],
  controllers: [CustomersController],
})
export class CustomersModule {}
