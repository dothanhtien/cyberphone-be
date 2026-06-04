import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { AddToCartDto, BuyNowDto, ResolveCartDto } from './dto';
import { StorefrontCartsService } from './storefront-carts.service';
import { CartQuantityAction } from '../enums';
import { Public } from '@/auth/decorators';

@Controller('carts')
@Public()
export class StorefrontCartsController {
  constructor(private readonly cartsService: StorefrontCartsService) {}

  @Post('resolve')
  resolveCart(@Body() resolveCartDto: ResolveCartDto) {
    return this.cartsService.resolve(resolveCartDto);
  }

  @Post('buy-now')
  buyNow(@Body() buyNowDto: BuyNowDto) {
    return this.cartsService.buyNow(buyNowDto);
  }

  @Post(':id/items')
  addToCart(@Param('id') id: string, @Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addToCart(id, addToCartDto);
  }

  @Patch(':id/items/:itemId/increase')
  increaseCartItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.cartsService.updateItemQuantity(
      id,
      itemId,
      CartQuantityAction.Increase,
    );
  }

  @Patch(':id/items/:itemId/decrease')
  decreaseCartItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.cartsService.updateItemQuantity(
      id,
      itemId,
      CartQuantityAction.Decrease,
    );
  }

  @Delete(':id/items/:itemId')
  removeCartItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.cartsService.removeCartItem(id, itemId);
  }
}
