import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { Customer } from './entities';
import { Identity } from '@/identities/entities';
import { CUSTOMER_REPOSITORY, CustomerRepository } from './repositories';
import { PasswordModule } from '@/password/password.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Identity]), PasswordModule],
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
