import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { Module } from '@nestjs/common';
import { CloudinaryStorageProvider } from './providers/cloudinary.provider';

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

@Module({
  imports: [CloudinaryModule],
  providers: [
    CloudinaryStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useExisting: CloudinaryStorageProvider,
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
