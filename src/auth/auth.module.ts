import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from './repositories';
import { JwtAuthGuard } from './guards';
import { RefreshTokenService } from './refresh-token.service';
import { LocalStrategy, JwtStrategy } from './strategies';
import { CustomersModule } from '@/customers/customers.module';
import { IdentitiesModule } from '@/identities/identities.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    UsersModule,
    CustomersModule,
    IdentitiesModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.getOrThrow<string>('JWT_ACCESS_SECRET');
        const expRaw = configService.getOrThrow<string>('ACCESS_TOKEN_TTL');
        const expNum = Number(expRaw);
        if (!Number.isFinite(expNum) || expNum <= 0) {
          throw new Error(
            'ACCESS_TOKEN_TTL must be a positive number (seconds)',
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
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenRepository,
    },
    RefreshTokenService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
