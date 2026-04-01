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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminProductsService } from './admin-products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { LoggedInUser } from '@/auth/decorators';
import { PaginationQueryDto } from '@/common/dto';

@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: AdminProductsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async create(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    createProductDto.createdBy = loggedInUserId;
    return this.productsService.create(createProductDto, images);
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async update(
    @UploadedFiles() images: Express.Multer.File[],
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    updateProductDto.updatedBy = loggedInUserId;
    return this.productsService.update(id, updateProductDto, images);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    await this.productsService.update(id, {
      isActive: false,
      updatedBy: loggedInUserId,
    });

    return true;
  }
}
