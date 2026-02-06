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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NonEmptyBodyPipe } from '@/common/pipes/non-empty-body.pipe';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/requests/create-category.dto';
import { UpdateCategoryDto } from './dto/requests/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @UploadedFile() logo: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    createCategoryDto.createdBy = 'admin'; // TODO: replace with actual user
    return this.categoriesService.create(createCategoryDto, logo);
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
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @UploadedFile() logo: Express.Multer.File,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateCategoryDto: UpdateCategoryDto,
  ) {
    updateCategoryDto.updatedBy = 'admin'; // TODO: replace with actual user
    return this.categoriesService.update(id, updateCategoryDto, logo);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    await this.categoriesService.update(id, {
      isActive: false,
      updatedBy: 'admin', // TODO: replace with actual user
    });
    return true;
  }
}
