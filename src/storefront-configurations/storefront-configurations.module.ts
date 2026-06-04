import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorefrontSlider, StorefrontConfiguration } from './entities';
import {
  STOREFRONT_CONFIGURATION_REPOSITORY,
  StorefrontConfigurationRepository,
  STOREFRONT_SLIDER_REPOSITORY,
  StorefrontSliderRepository,
} from './repositories';
import { StorefrontConfigurationsController } from './storefront-configurations.controller';
import { StorefrontConfigurationsService } from './storefront-configurations.service';
import { StorefrontSlidersController } from './storefront-sliders.controller';
import { StorefrontSlidersService } from './storefront-sliders.service';
import { CategoriesModule } from '@/categories/categories.module';
import { MediaModule } from '@/media/media.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StorefrontSlider, StorefrontConfiguration]),
    CategoriesModule,
    MediaModule,
    StorageModule,
  ],
  providers: [
    StorefrontSlidersService,
    StorefrontConfigurationsService,
    {
      provide: STOREFRONT_CONFIGURATION_REPOSITORY,
      useClass: StorefrontConfigurationRepository,
    },
    {
      provide: STOREFRONT_SLIDER_REPOSITORY,
      useClass: StorefrontSliderRepository,
    },
  ],
  controllers: [
    StorefrontConfigurationsController,
    StorefrontSlidersController,
  ],
})
export class StorefrontConfigurationsModule {}
