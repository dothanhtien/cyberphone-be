import { Inject, Injectable, Logger } from '@nestjs/common';
import { PRODUCT_FOLDER } from '@/common/constants';
import { getErrorStack, getFilename } from '@/common/utils';
import { STORAGE_PROVIDER } from '@/storage/storage.module';
import {
  StorageUploadResult,
  type StorageProvider,
} from '@/storage/storage.provider';

@Injectable()
export class AdminProductImageUploadService {
  private readonly logger = new Logger(AdminProductImageUploadService.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async upload(images: Express.Multer.File[]): Promise<StorageUploadResult[]> {
    if (!images.length) return [];

    this.logger.log(`[upload] Uploading ${images.length} image(s)`);

    const settled = await Promise.allSettled(
      images.map((file) =>
        this.storageProvider.upload(file, {
          folder: PRODUCT_FOLDER,
          filename: getFilename(file.originalname),
        }),
      ),
    );

    const succeeded: StorageUploadResult[] = [];
    const failed: PromiseRejectedResult[] = [];

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        succeeded.push(result.value);
      } else {
        failed.push(result);
      }
    }

    if (failed.length > 0) {
      this.logger.error(
        `[upload] ${failed.length}/${images.length} image(s) failed. Cleaning up ${succeeded.length} succeeded upload(s)`,
      );

      await this.cleanup(succeeded).catch((cleanupErr) => {
        this.logger.error(
          `[upload] Cleanup failed after partial upload`,
          getErrorStack(cleanupErr),
        );
      });

      throw failed[0].reason;
    }

    this.logger.log(
      `[upload] Successfully uploaded ${succeeded.length} image(s)`,
    );

    return succeeded;
  }

  async cleanup(uploads: StorageUploadResult[]): Promise<void> {
    if (!uploads.length) return;

    this.logger.warn(`Cleaning up ${uploads.length} uploaded files`);

    await Promise.all(
      uploads.map(async (upload) => {
        try {
          await this.storageProvider.delete(upload.key);
        } catch (error) {
          this.logger.error(
            `Failed to cleanup uploaded file: ${upload.key}`,
            getErrorStack(error),
          );
        }
      }),
    );
  }

  async delete(keys: string[]): Promise<void> {
    if (!keys.length) return;
    await Promise.all(keys.map((k) => this.storageProvider.delete(k)));
  }
}
