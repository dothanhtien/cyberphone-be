import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { StorefrontProductsService } from './storefront-products.service';
import { FilterProductsDto } from './dto/requests/filter-products.dto';

@Public()
@Controller('/products')
export class StorefrontProductsController {
  constructor(private readonly productsService: StorefrontProductsService) {}

  @Get()
  findAll(@Query() filterProductsDto: FilterProductsDto) {
    return this.productsService.findAll(filterProductsDto);
  }
}
