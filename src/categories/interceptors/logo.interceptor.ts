import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { BadRequestException } from '@nestjs/common';

export function CategoryLogoInterceptor() {
  return FileInterceptor('logo', {
    storage: diskStorage({
      destination: './uploads/categories',
      filename: (req, file, callback) => {
        const body = req.body as CreateCategoryDto;
        const slug = body.slug;

        const safeSlug = slug
          .toString()
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase();

        const fileExt = extname(file.originalname);
        const finalName = `${safeSlug}-${Date.now()}${fileExt}`;
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
