import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/requests/create-order.dto';
import { StorefrontOrdersService } from './storefront-orders.service';
import { Public } from '@/auth/decorators/public.decorator';

@Public()
@Controller('orders')
export class StorefrontOrdersController {
  constructor(
    private readonly storefrontOrdersService: StorefrontOrdersService,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.storefrontOrdersService.create(createOrderDto);
  }
}
