import { Body, Controller, Param, Post } from '@nestjs/common';
import { StorefrontCartsService } from './storefront-carts.service';
import { Public } from '@/auth/decorators/public.decorator';
import { ResolveCartDto } from './dto/requests/resolve-cart.dto';
import { AddToCartDto } from './dto/requests/add-to-cart.dto';

@Controller('carts')
@Public()
export class StorefrontCartsController {
  constructor(private readonly cartsService: StorefrontCartsService) {}

  @Post('resolve')
  resolveCart(@Body() resolveCartDto: ResolveCartDto) {
    return this.cartsService.resolve(resolveCartDto);
  }

  @Post(':id/items')
  addToCart(@Param('id') id: string, @Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addToCart(id, addToCartDto);
  }
}
