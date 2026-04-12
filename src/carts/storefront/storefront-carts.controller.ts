import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { AddToCartDto, ResolveCartDto } from './dto';
import { StorefrontCartsService } from './storefront-carts.service';
import { Public } from '@/auth/decorators';

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

  @Patch(':id/items/:itemId/increase')
  increaseCartItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.cartsService.updateItemQuantity(id, itemId, 'increase');
  }

  @Patch(':id/items/:itemId/decrease')
  decreaseCartItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.cartsService.updateItemQuantity(id, itemId, 'decrease');
  }

  @Delete(':id/items/:itemId')
  removeCartItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.cartsService.removeCartItem(id, itemId);
  }
}
