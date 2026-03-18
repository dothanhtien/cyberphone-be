import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { MediaModule } from '@/media/media.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), MediaModule, StorageModule],
  providers: [BrandsService],
  controllers: [BrandsController],
  exports: [BrandsService],
})
export class BrandsModule {}
