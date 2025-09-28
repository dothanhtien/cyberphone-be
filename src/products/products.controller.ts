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
} from '@nestjs/common';
import { NonEmptyBodyPipe } from '@/common/pipes/non-empty-body.pipe';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Body(new NonEmptyBodyPipe()) createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    createProductDto.createdBy = user.id;
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    updateProductDto.updatedBy = user.id;
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    await this.productsService.update(id, {
      isActive: false,
      updatedBy: user.id,
    });
    return true;
  }
}
