import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminCustomersController } from './admin/admin-customers.controller';
import { CustomersService } from './customers.service';
import { Customer } from './entities';
import { CUSTOMER_REPOSITORY, CustomerRepository } from './repositories';
import { Identity } from '@/identities/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Identity])],
  controllers: [AdminCustomersController],
  providers: [
    CustomersService,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepository,
    },
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
