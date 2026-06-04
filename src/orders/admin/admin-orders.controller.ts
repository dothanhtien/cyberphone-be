import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { AdminOrdersService } from './admin-orders.service';
import { PaginationQueryDto } from '@/common/dto';
import { Roles } from '@/auth/decorators';
import { UserRole } from '@/users/enums';

@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.ordersService.findOne(id);
  }
}
