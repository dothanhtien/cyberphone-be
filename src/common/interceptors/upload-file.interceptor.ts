import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UPLOADS_ROOT } from '@/common/constants/path';

export function UploadFileInterceptor({
  fieldName,
  folder,
}: {
  fieldName: string;
  folder: string;
}) {
  return FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const dest = join(UPLOADS_ROOT, folder);
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        callback(null, dest);
      },
      filename: (req, file, callback) => {
        const fileName = uuid();
        const fileExt = extname(file.originalname).toLowerCase();
        const finalName = `${fileName}${fileExt}`;
        callback(null, finalName);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(
          new BadRequestException('Only JPG, JPEG, or PNG images are allowed!'),
          false,
        );
      }
      callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}
