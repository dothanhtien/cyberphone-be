import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { LoggedInUser } from '@/auth/decorators/logged-in-user.decorator';
import { User } from '@/users/entities/user.entity';
import { CreateProductVariantDto } from './dto/requests/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/requests/update-product-variant.dto';

@Controller()
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post('products/:productId/variants')
  async create(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Body() createProductVariantDto: CreateProductVariantDto,
    @LoggedInUser() loggedInUser: User,
  ) {
    createProductVariantDto.createdBy = loggedInUser.id;
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
    @LoggedInUser() loggedInUser: User,
  ) {
    updateProductVariantDto.updatedBy = loggedInUser.id;
    return this.productVariantsService.update(id, updateProductVariantDto);
  }
}
