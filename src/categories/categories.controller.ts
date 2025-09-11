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
import { MulterExceptionFilter } from 'src/common/filters/multer-exception.filter';
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

    return this.categoriesService.create(createCategoryDto);
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
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: User,
  ) {
    updateCategoryDto.updatedBy = user.id;
    return this.categoriesService.update(id, updateCategoryDto);
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
