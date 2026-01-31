import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CLOUDINARY_CLIENT } from './cloudinary.client.provider';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CLOUDINARY_CLIENT)
    private readonly cloudinaryClient: typeof cloudinary,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    options: {
      folder: string;
      filename?: string;
    },
  ): Promise<UploadApiResponse> {
    const rootFolder =
      this.configService.get<string>('CLOUDINARY_ROOT_FOLDER') ?? '';

    const fullFolder = rootFolder
      ? `${rootFolder}/${options.folder}`
      : options.folder;

    return new Promise((resolve, reject) => {
      this.cloudinaryClient.uploader
        .upload_stream(
          {
            folder: fullFolder,
            public_id: options.filename,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('Upload failed'));
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: {
      folder: string;
      filenamePrefix?: string;
    },
  ): Promise<UploadApiResponse[]> {
    return Promise.all(
      files.map((file, index) =>
        this.uploadFile(file, {
          folder: options.folder,
          filename: options.filenamePrefix
            ? `${options.filenamePrefix}-${index + 1}`
            : undefined,
        }),
      ),
    );
  }

  async deleteFile(publicId: string): Promise<any> {
    return this.cloudinaryClient.uploader.destroy(publicId);
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<any> {
    return this.cloudinaryClient.api.delete_resources(publicIds);
  }

  async getFileDetails(publicId: string): Promise<any> {
    return this.cloudinaryClient.api.resource(publicId);
  }
}
