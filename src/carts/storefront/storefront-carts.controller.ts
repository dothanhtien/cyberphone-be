import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StorefrontCartsService } from './storefront-carts.service';
import { Public } from '@/auth/decorators/public.decorator';
import { CreateCartDto } from './dto/requests/create-cart.dto';

@Controller('carts')
@Public()
export class StorefrontCartsController {
  constructor(private readonly cartsService: StorefrontCartsService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.create(createCartDto);
  }

  @Get()
  getCart(
    @Query('userId') userId?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.cartsService.getCartByUserOrSession({
      userId,
      sessionId,
    });
  }
}
