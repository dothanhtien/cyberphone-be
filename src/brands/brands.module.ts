import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { MediaAssetsModule } from '@/media-assets/media-assets.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand]),
    MediaAssetsModule,
    StorageModule,
  ],
  providers: [BrandsService],
  controllers: [BrandsController],
  exports: [BrandsService],
})
export class BrandsModule {}
