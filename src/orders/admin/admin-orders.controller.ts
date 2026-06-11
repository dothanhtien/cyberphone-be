import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { AdminOrdersService } from './admin-orders.service';
import { UpdateOrderStatusDto } from './dto';
import { LoggedInUser, Roles } from '@/auth/decorators';
import { PaginationQueryDto } from '@/common/dto';
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

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @LoggedInUser('identityId') updatedBy: string,
  ) {
    return this.ordersService.updateStatus(id, dto, updatedBy);
  }
}
