import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: config.getOrThrow<string>('DATABASE_HOST'),
          port: Number(config.getOrThrow<string>('DATABASE_PORT')),
          username: config.getOrThrow<string>('DATABASE_USER'),
          password: config.getOrThrow<string>('DATABASE_PASSWORD'),
          database: config.getOrThrow<string>('DATABASE_NAME'),
          autoLoadEntities: true,
          synchronize: config.get<boolean>('DATABASE_SYNCHRONIZE') ?? !isProd,
          logging: config.get<boolean>('DATABASE_LOGGING') ?? !isProd,
          ssl: config.get<string>('DATABASE_SSL') === 'true',
          retryAttempts: config.get<number>('DATABASE_RETRY_ATTEMPTS') ?? 10,
          retryDelay: config.get<number>('DATABASE_RETRY_DELAY') ?? 3000,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
