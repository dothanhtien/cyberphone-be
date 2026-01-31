import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryClientProvider } from './cloudinary.client.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryClientProvider, CloudinaryService],
  exports: [CloudinaryClientProvider, CloudinaryService],
})
export class CloudinaryModule {}
