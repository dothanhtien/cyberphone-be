import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from '@/identities/entities';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordModule } from '@/password/password.module';
import {
  USER_REPOSITORY,
  UserRepository,
} from './repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, Identity]), PasswordModule],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
