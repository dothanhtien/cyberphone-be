import { Controller, Get, Param, Query } from '@nestjs/common';
import { AdminOrdersService } from './admin-orders.service';
import { PaginationQueryDto } from '@/common/dto';

@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
