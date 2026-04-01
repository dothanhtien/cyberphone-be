import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProductVariantDto } from './dto/requests/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/requests/update-product-variant.dto';
import { ProductVariantsService } from './product-variants.service';
import { LoggedInUser } from '@/auth/decorators';

@Controller('admin')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post('products/:productId/variants')
  async create(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Body() createProductVariantDto: CreateProductVariantDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    createProductVariantDto.createdBy = loggedInUserId;
    return this.productVariantsService.create(
      productId,
      createProductVariantDto,
    );
  }

  @Get('products/:productId/variants')
  findAllByProductId(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
  ) {
    return this.productVariantsService.findAllByProductId(productId);
  }

  @Patch('product-variants/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    updateProductVariantDto.updatedBy = loggedInUserId;
    return this.productVariantsService.update(id, updateProductVariantDto);
  }
}
