import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProductAsset } from './entities/product-assets.entity';
import { ProductAssetsService } from './product-assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductAsset])],
  providers: [ProductAssetsService],
  exports: [ProductAssetsService],
})
export class ProductAssetsModule {}
