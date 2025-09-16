import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdir } from 'fs/promises';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

export function CategoryLogoInterceptor() {
  return FileInterceptor('logo', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const dest = join(process.cwd(), 'uploads', 'categories');
        mkdir(dest, { recursive: true })
          .then(() => callback(null, dest))
          .catch((err: unknown) => {
            if (err instanceof Error) {
              callback(err, dest);
            } else {
              callback(new Error(String(err)), dest);
            }
          });
      },
      filename: (req, file, callback) => {
        const body = req.body as Partial<CreateCategoryDto & UpdateCategoryDto>;
        const base = (body.slug ?? req.params?.id ?? 'category').toString();
        const safeSlug = base
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const fileExt = extname(file.originalname).toLowerCase();
        const finalName = `${Date.now()}-${safeSlug}${fileExt}`;
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
