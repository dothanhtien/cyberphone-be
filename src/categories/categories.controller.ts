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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { LoggedInUser } from '@/auth/decorators';
import { PaginationQueryDto } from '@/common/dto';

@Controller('admin/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @UploadedFile() logo: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    createCategoryDto.createdBy = loggedInUserId;
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
    @Body() updateCategoryDto: UpdateCategoryDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    updateCategoryDto.updatedBy = loggedInUserId;
    return this.categoriesService.update(id, updateCategoryDto, logo);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    await this.categoriesService.update(id, {
      isActive: false,
      updatedBy: loggedInUserId,
    });
    return true;
  }
}
