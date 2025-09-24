import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { PasswordModule } from '@/common/password/password.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PasswordModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
