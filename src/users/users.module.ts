import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import {
  ROLE_REPOSITORY,
  RoleRepository,
  USER_REPOSITORY,
  UserRepository,
} from './repositories';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Identity } from '@/identities/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Identity, Role, User])],
  providers: [
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
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
