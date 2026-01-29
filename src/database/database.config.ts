import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProd = configService.get<string>('NODE_ENV') === 'production';
  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('DATABASE_HOST'),
    port: Number(configService.getOrThrow<string>('DATABASE_PORT')),
    username: configService.getOrThrow<string>('DATABASE_USER'),
    password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
    database: configService.getOrThrow<string>('DATABASE_NAME'),
    autoLoadEntities: true,
    synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE') ?? !isProd,
    logging: configService.get<boolean>('DATABASE_LOGGING') ?? !isProd,
    ssl: configService.get<string>('DATABASE_SSL') === 'true',
    retryAttempts: configService.get<number>('DATABASE_RETRY_ATTEMPTS') ?? 10,
    retryDelay: configService.get<number>('DATABASE_RETRY_DELAY') ?? 3000,
  };
};
