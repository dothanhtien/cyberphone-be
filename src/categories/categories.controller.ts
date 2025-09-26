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
import { CategoriesService } from './categories.service';
import { NonEmptyBodyPipe } from '@/common/pipes/non-empty-body.pipe';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryLogoInterceptor } from './interceptors/category-logo.interceptor';
import { MulterExceptionFilter } from '@/common/filters/multer-exception.filter';
import { withFileTransaction } from '@/common/helpers/with-file-transaction.helper';
import { join } from 'path';
import { unlink } from 'fs/promises';

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
    createCategoryDto.createdBy = user.id;

    return withFileTransaction(
      () => this.categoriesService.create(createCategoryDto),
      logo ? `uploads/categories/${logo.filename}` : undefined,
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

    updateCategoryDto.updatedBy = user.id;

    return withFileTransaction(
      () => this.categoriesService.update(id, updateCategoryDto),
      logo ? `uploads/categories/${logo.filename}` : undefined,
    ).then((savedCategory) => {
      if ((updateCategoryDto.removeLogo || !!logo) && oldLogoPath) {
        const relativeOld = oldLogoPath.replace(/^\/+/, '');
        const filePath = join(process.cwd(), relativeOld);
        unlink(filePath).catch((err) =>
          console.error('Failed to delete old logo:', err),
        );
      }
      return savedCategory;
    });
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
