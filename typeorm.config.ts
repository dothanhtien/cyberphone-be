import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  entities:
    process.env.NODE_ENV === 'production'
      ? ['dist/**/*.entity.js']
      : ['src/**/*.entity.ts'],
  migrations:
    process.env.NODE_ENV === 'production'
      ? ['dist/migrations/*.js']
      : ['src/migrations/*.ts'],
});
