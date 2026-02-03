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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @UploadedFile() logo: Express.Multer.File,
    @Body() createBrandDto: CreateBrandDto,
  ) {
    createBrandDto.createdBy = 'admin'; // TODO: replace with actual user
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
    @Body(new NonEmptyBodyPipe()) updateBrandDto: UpdateBrandDto,
  ) {
    updateBrandDto.updatedBy = 'admin'; // TODO: replace with actual user
    return this.brandsService.update(id, updateBrandDto, logo);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    await this.brandsService.update(id, {
      isActive: false,
      updatedBy: 'admin', // TODO: replace with actual user
    });
    return true;
  }
}
