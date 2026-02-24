import { AppModule } from '@/app.module';
import { NestFactory } from '@nestjs/core';
import { SeedsService } from './seeds.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seedsService = app.get(SeedsService);
  await seedsService.run();

  await app.close();
}

void bootstrap();
