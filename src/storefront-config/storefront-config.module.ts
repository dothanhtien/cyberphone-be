import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminStorefrontConfigController } from './admin/admin-storefront-config.controller';
import { AdminStorefrontSlidersService } from './admin/admin-storefront-sliders.service';
import { StorefrontSlider } from './entities';
import {
  STOREFRONT_SLIDER_REPOSITORY,
  StorefrontSliderRepository,
} from './repositories';
import { MediaModule } from '@/media/media.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StorefrontSlider]),
    MediaModule,
    StorageModule,
  ],
  providers: [
    AdminStorefrontSlidersService,
    {
      provide: STOREFRONT_SLIDER_REPOSITORY,
      useClass: StorefrontSliderRepository,
    },
  ],
  controllers: [AdminStorefrontConfigController],
})
export class StorefrontConfigModule {}
