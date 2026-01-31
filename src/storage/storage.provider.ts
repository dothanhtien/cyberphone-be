export interface StorageUploadResult {
  key: string;
  url: string;
  resourceType: string;
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
