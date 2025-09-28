import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';
import { NonEmptyBodyPipe } from '@/common/pipes/non-empty-body.pipe';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Controller('product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post()
  create(
    @Body() createProductVariantDto: CreateProductVariantDto,
    @CurrentUser() user: User,
  ) {
    createProductVariantDto.createdBy = user.id;
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe())
    updateProductVariantDto: UpdateProductVariantDto,
    @CurrentUser() user: User,
  ) {
    updateProductVariantDto.updatedBy = user.id;
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    return this.productVariantsService.remove(id, { updatedBy: user.id });
  }
}
