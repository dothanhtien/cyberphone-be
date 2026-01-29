import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProd = configService.get<string>('NODE_ENV') === 'production';
  const syncEnv = configService.get<string>('DATABASE_SYNCHRONIZE');
  const loggingEnv = configService.get<string>('DATABASE_LOGGING');
  const retryAttemptsEnv = configService.get<string>('DATABASE_RETRY_ATTEMPTS');
  const retryDelayEnv = configService.get<string>('DATABASE_RETRY_DELAY');
  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('DATABASE_HOST'),
    port: Number(configService.getOrThrow<string>('DATABASE_PORT')),
    username: configService.getOrThrow<string>('DATABASE_USER'),
    password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
    database: configService.getOrThrow<string>('DATABASE_NAME'),
    autoLoadEntities: true,
    synchronize: syncEnv !== undefined ? syncEnv === 'true' : !isProd,
    logging: loggingEnv !== undefined ? loggingEnv === 'true' : !isProd,
    ssl: configService.get<string>('DATABASE_SSL') === 'true',
    retryAttempts: retryAttemptsEnv ? Number(retryAttemptsEnv) : 10,
    retryDelay: retryDelayEnv ? Number(retryDelayEnv) : 3000,
  };
};
