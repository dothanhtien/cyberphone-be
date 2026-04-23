import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities';
import { CATEGORY_REPOSITORY, CategoryRepository } from './repositories';
import { MediaModule } from '@/media/media.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), MediaModule, StorageModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepository,
    },
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
