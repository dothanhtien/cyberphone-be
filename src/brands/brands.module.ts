import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { Brand } from './entities';
import { BRAND_REPOSITORY, BrandRepository } from './repositories';
import { MediaModule } from '@/media/media.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), MediaModule, StorageModule],
  providers: [
    BrandsService,
    {
      provide: BRAND_REPOSITORY,
      useClass: BrandRepository,
    },
  ],
  controllers: [BrandsController],
  exports: [BrandsService],
})
export class BrandsModule {}
