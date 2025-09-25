import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '@/users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expRaw = configService.get<string>('JWT_TOKEN_EXPIRATION');
        const expNum = Number(expRaw);
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }
        if (!Number.isFinite(expNum) || expNum <= 0) {
          throw new Error(
            'JWT_TOKEN_EXPIRATION must be a positive number (seconds)',
          );
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
  ],
  controllers: [AuthController],
})
export class AuthModule {}
