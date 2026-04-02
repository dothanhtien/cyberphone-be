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
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto';
import { PaginationQueryDto } from '@/common/dto';
import { LoggedInUser } from '@/auth/decorators';

@Controller('admin/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @UploadedFile() logo: Express.Multer.File,
    @Body() createBrandDto: CreateBrandDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    createBrandDto.createdBy = loggedInUserId;
    return this.brandsService.create(createBrandDto, logo);
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
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @UploadedFile() logo: Express.Multer.File,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    updateBrandDto.updatedBy = loggedInUserId;
    return this.brandsService.update(id, updateBrandDto, logo);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    await this.brandsService.update(id, {
      isActive: false,
      updatedBy: loggedInUserId,
    });

    return true;
  }
}
