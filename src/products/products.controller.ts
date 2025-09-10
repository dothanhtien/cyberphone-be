import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { NonEmptyBodyPipe } from 'src/validation/non-empty-body.pipe';
import { CreateProductDto } from './dto/create-product.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Public } from 'src/auth/decorators/public.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

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
}
