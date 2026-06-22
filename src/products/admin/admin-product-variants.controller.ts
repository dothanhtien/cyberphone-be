import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminProductVariantsService } from './admin-product-variants.service';
import { CreateProductVariantDto, UpdateProductVariantDto } from './dto';
import { LoggedInUser, Roles } from '@/auth/decorators';
import { UserRole } from '@/users/enums';

@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminProductVariantsController {
  constructor(
    private readonly productVariantsService: AdminProductVariantsService,
  ) {}

  @Post('products/:productId/variants')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @UploadedFiles() images: Express.Multer.File[],
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Body() createProductVariantDto: CreateProductVariantDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    createProductVariantDto.createdBy = loggedInUserId;
    return this.productVariantsService.create(
      productId,
      createProductVariantDto,
      images,
    );
  }

  @Get('products/:productId/variants')
  findAllByProductId(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
  ) {
    return this.productVariantsService.findAllByProductId(productId);
  }

  @Get('product-variants/:id')
  findOneById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productVariantsService.findOneById(id);
  }

  @Patch('product-variants/:id')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @UploadedFiles() images: Express.Multer.File[],
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    updateProductVariantDto.updatedBy = loggedInUserId;
    return this.productVariantsService.update(
      id,
      updateProductVariantDto,
      images,
    );
  }

  @Delete('product-variants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productVariantsService.delete(id);
  }
}
