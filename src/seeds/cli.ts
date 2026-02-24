import { AppModule } from '@/app.module';
import { NestFactory } from '@nestjs/core';
import { SeedsService } from './seeds.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const seedsService = app.get(SeedsService);
    await seedsService.run();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
