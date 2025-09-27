import {
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
import { NonEmptyBodyPipe } from '@/common/pipes/non-empty-body.pipe';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { MulterExceptionFilter } from '@/common/filters/multer-exception.filter';
import { withFileTransaction } from '@/common/helpers/with-file-transaction.helper';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryLogoInterceptor } from './interceptors/category-logo.interceptor';
import { UPLOADS_ROOT } from '@/common/constants/path';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(CategoryLogoInterceptor())
  @UseFilters(MulterExceptionFilter)
  create(
    @Body(new NonEmptyBodyPipe()) createCategoryDto: CreateCategoryDto,
    @UploadedFile() logo: Express.Multer.File | undefined,
    @CurrentUser() user: User,
  ) {
    if (logo) {
      createCategoryDto.logoUrl = `/uploads/categories/${logo.filename}`;
    }
    createCategoryDto.createdBy = user.id;

    return withFileTransaction(
      () => this.categoriesService.create(createCategoryDto),
      createCategoryDto.logoUrl,
    );
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(CategoryLogoInterceptor())
  @UseFilters(MulterExceptionFilter)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() logo: Express.Multer.File | undefined,
    @CurrentUser() user: User,
  ) {
    const oldLogoPath = await this.categoriesService.getLogoPath(id);

    if (logo) {
      updateCategoryDto.logoUrl = `/uploads/categories/${logo.filename}`;
    }

    updateCategoryDto.updatedBy = user.id;

    const savedCategory = await withFileTransaction(
      () => this.categoriesService.update(id, updateCategoryDto),
      updateCategoryDto.logoUrl,
    );
    if ((updateCategoryDto.removeLogo || !!logo) && oldLogoPath) {
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
    return savedCategory;
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    await this.categoriesService.update(id, {
      isActive: false,
      updatedBy: user.id,
    });
    return true;
  }
}
