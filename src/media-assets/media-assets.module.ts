import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaAsset } from './entities/media-asset.entity';
import { MediaAssetsService } from './media-assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaAsset])],
  providers: [MediaAssetsService],
  exports: [MediaAssetsService],
})
export class MediaAssetsModule {}
