import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IdentityService } from './identity.service';
import { JwtAuthGuard } from './guards';
import { LocalStrategy, JwtStrategy } from './strategies';
import { CustomersModule } from '@/customers/customers.module';
import { PasswordModule } from '@/password/password.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    UsersModule,
    CustomersModule,
    PasswordModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.getOrThrow<string>('JWT_SECRET');
        const expRaw = configService.getOrThrow<string>('JWT_EXPIRES_IN');
        const expNum = Number(expRaw);
        if (!Number.isFinite(expNum) || expNum <= 0) {
          throw new Error('JWT_EXPIRES_IN must be a positive number (seconds)');
        }
        return {
          secret,
          signOptions: {
            expiresIn: `${expNum}s`,
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    IdentityService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
