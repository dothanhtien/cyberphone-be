import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { MediaAssetsModule } from '@/media-assets/media-assets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    CloudinaryModule,
    MediaAssetsModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
