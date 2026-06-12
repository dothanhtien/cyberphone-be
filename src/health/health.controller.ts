import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @Public()
  async check() {
    const db = await this.dataSource
      .query('SELECT 1')
      .then(() => 'up')
      .catch(() => 'down');

    if (db === 'down') {
      throw new ServiceUnavailableException({ status: 'error', db });
    }

    return { status: 'ok', db, test: 'test deploy' };
  }
}
