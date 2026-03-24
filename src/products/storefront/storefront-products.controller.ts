import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@/auth/decorators';
import { StorefrontProductsService } from './storefront-products.service';
import { FilterProductsDto } from './dto';

@Public()
@Controller('/products')
export class StorefrontProductsController {
  constructor(private readonly productsService: StorefrontProductsService) {}

  @Get()
  findAll(@Query() filterProductsDto: FilterProductsDto) {
    return this.productsService.findAll(filterProductsDto);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }
}
