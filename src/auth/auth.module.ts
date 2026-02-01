import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/users/users.module';
import { PasswordModule } from '@/password/password.module';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [UsersModule, PasswordModule],
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
