import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { relative, resolve } from 'path';
import { unlink } from 'fs/promises';
import { MulterExceptionFilter } from '@/common/filters/multer-exception.filter';
import { withFileTransaction } from '@/common/helpers/with-file-transaction.helper';
import { UploadFileInterceptor } from '@/common/interceptors/upload-file.interceptor';
import { NonEmptyBodyPipe } from '@/common/pipes/non-empty-body.pipe';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { UPLOADS_ROOT } from '@/common/constants/path';
import { User } from '@/users/entities/user.entity';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseInterceptors(
    UploadFileInterceptor({ fieldName: 'logo', folder: 'brands' }),
  )
  @UseFilters(MulterExceptionFilter)
  create(
    @Body(new NonEmptyBodyPipe()) createBrandDto: CreateBrandDto,
    @UploadedFile() logo: Express.Multer.File | undefined,
    @CurrentUser() user: User,
  ) {
    if (logo) {
      createBrandDto.logoUrl = `/uploads/brands/${logo.filename}`;
    }
    createBrandDto.createdBy = user.id;

    return withFileTransaction(
      () => this.brandsService.create(createBrandDto),
      createBrandDto.logoUrl ? [createBrandDto.logoUrl] : [],
    );
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    UploadFileInterceptor({
      fieldName: 'logo',
      folder: 'brands',
    }),
  )
  @UseFilters(MulterExceptionFilter)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateBrandDto: UpdateBrandDto,
    @UploadedFile() logo: Express.Multer.File | undefined,
    @CurrentUser() user: User,
  ) {
    if (logo && updateBrandDto.removeLogo) {
      await unlink(logo.path).catch(() => {});
      throw new BadRequestException(
        'You cannot upload a logo and set removeLogo at the same time',
      );
    }

    const oldLogoPath = await this.brandsService.getLogoPath(id);

    if (logo) {
      updateBrandDto.logoUrl = `/uploads/brands/${logo.filename}`;
    }

    updateBrandDto.updatedBy = user.id;

    const savedBrand = await withFileTransaction(
      () => this.brandsService.update(id, updateBrandDto),
      updateBrandDto.logoUrl ? [updateBrandDto.logoUrl] : [],
    );
    if ((updateBrandDto.removeLogo || !!logo) && oldLogoPath) {
      const sanitized = oldLogoPath
        .replace(/^[/\\]+/, '')
        .replace(/^uploads[/\\]?/i, '');
      const fullPath = resolve(UPLOADS_ROOT, sanitized);
      const relativePath = relative(UPLOADS_ROOT, fullPath);
      if (!relativePath.startsWith('..') && relativePath !== '') {
        unlink(fullPath).catch((err) =>
          console.error('Failed to delete old logo:', err),
        );
      } else {
        console.error(
          'Refusing to delete file outside uploads root:',
          fullPath,
        );
      }
    }
    return savedBrand;
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    await this.brandsService.update(id, {
      isActive: false,
      updatedBy: user.id,
    });
    return true;
  }
}
