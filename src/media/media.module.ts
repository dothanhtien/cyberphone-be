import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaAsset } from './entities';
import { MediaService } from './media.service';
import { MediaAssetsService } from './media-assets.service';
import { MediaController } from './media.controller';
import { Brand } from '@/brands/entities';
import { Category } from '@/categories/entities';
import { Product } from '@/products/entities';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaAsset, Brand, Category, Product]),
    StorageModule,
  ],
  providers: [MediaAssetsService, MediaService],
  controllers: [MediaController],
  exports: [MediaAssetsService],
})
export class MediaModule {}
