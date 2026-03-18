import { MediaAssetResourceType } from '@/common/enums';

export interface StorageUploadResult {
  key: string;
  url: string;
  resourceType: MediaAssetResourceType;
}

export interface StorageProvider {
  upload(
    file: Express.Multer.File,
    options: {
      folder: string;
      filename?: string;
    },
  ): Promise<StorageUploadResult>;

  delete(publicId: string): Promise<void>;
}
