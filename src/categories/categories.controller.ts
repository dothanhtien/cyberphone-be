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
import { join } from 'path';
import { unlink } from 'fs/promises';
import { MulterExceptionFilter } from 'src/common/filters/multer-exception.filter';
import { withFileTransaction } from 'src/common/helpers';
import { NonEmptyBodyPipe } from 'src/validation/non-empty-body.pipe';
import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { User } from 'src/users/entities/user.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryLogoInterceptor } from './interceptors/logo.interceptor';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(CategoryLogoInterceptor())
  @UseFilters(MulterExceptionFilter)
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() logo: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    createCategoryDto.createdBy = user.id;

    if (logo) {
      createCategoryDto.logoUrl = `/uploads/categories/${logo.filename}`;
    }

    return withFileTransaction(
      () => this.categoriesService.create(createCategoryDto),
      logo ? `/uploads/categories/${logo.filename}` : undefined,
    );
  }

  @Get()
  @Public()
  findAll(@Query() query: PaginationQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(CategoryLogoInterceptor())
  @UseFilters(MulterExceptionFilter)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() logo: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    const oldLogoPath = await this.categoriesService.getLogoPath(id);

    if (logo) {
      updateCategoryDto.logoUrl = `/uploads/categories/${logo.filename}`;
    }

    updateCategoryDto.updatedBy = user.id;

    return withFileTransaction(
      () => this.categoriesService.update(id, updateCategoryDto),
      logo ? `/uploads/categories/${logo.filename}` : undefined,
    ).then((savedCategory) => {
      if (updateCategoryDto.removeLogo && oldLogoPath) {
        const filePath = join(process.cwd(), 'public', oldLogoPath);
        unlink(filePath).catch((err) =>
          console.error('Failed to delete old logo:', err),
        );
      }
      return savedCategory;
    });
  }

  @Delete(':id')
  async deactiveCategory(
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
