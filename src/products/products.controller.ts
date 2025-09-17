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
import { ProductsService } from './products.service';
import { NonEmptyBodyPipe } from 'src/validation/non-empty-body.pipe';
import { CreateProductDto } from './dto/create-product.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Public } from 'src/auth/decorators/public.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
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
  @Public()
  findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Public()
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
  async deactiveBrand(
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
