import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { CustomerOrdersService } from './customer-orders.service';
import { PaginationQueryDto } from '@/common/dto';
import { LoggedInUser, Roles } from '@/auth/decorators';
import { UserRole } from '@/users/enums';

@Roles(UserRole.CUSTOMER)
@Controller('customer/orders')
export class CustomerOrdersController {
  constructor(private readonly customerOrdersService: CustomerOrdersService) {}

  @Get()
  findAll(
    @LoggedInUser('id') customerId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.customerOrdersService.findAll(customerId, query);
  }

  @Get(':id')
  findOne(
    @LoggedInUser('id') customerId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.customerOrdersService.findOne(customerId, id);
  }
}
