import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

export function CategoryLogoInterceptor() {
  return FileInterceptor('logo', {
    storage: diskStorage({
      destination: './uploads/categories',
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
