import { Injectable } from '@nestjs/common';
import { StorageProvider, StorageUploadResult } from '../storage.provider';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async upload(
    file: Express.Multer.File,
    { folder, filename }: { folder: string; filename?: string },
  ): Promise<StorageUploadResult> {
    const result = await this.cloudinaryService.uploadFile(file, {
      folder,
      filename,
    });
    return {
      key: result.public_id,
      url: result.secure_url,
      resourceType: result.resource_type,
    };
  }

  async delete(key: string) {
    await this.cloudinaryService.deleteFile(key);
  }
}
