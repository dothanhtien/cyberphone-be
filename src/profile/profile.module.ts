import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { CustomersModule } from '@/customers/customers.module';
import { IdentitiesModule } from '@/identities/identities.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [UsersModule, CustomersModule, IdentitiesModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
