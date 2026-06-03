import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  DateRangeFilterDto,
  LimitFilterDto,
  TopProductsFilterDto,
} from './dto';
import { Roles } from '@/auth/decorators';
import { UserRole } from '@/users/enums';

@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Query() filterDto: DateRangeFilterDto) {
    return this.dashboardService.getSummary(filterDto);
  }

  @Get('revenue')
  getRevenue(@Query() filterDto: DateRangeFilterDto) {
    return this.dashboardService.getRevenue(filterDto);
  }

  @Get('top-category-sales')
  getTopCategorySales(@Query() filterDto: DateRangeFilterDto) {
    return this.dashboardService.getTopCategorySales(filterDto);
  }

  @Get('top-products')
  getTopProducts(@Query() filterDto: TopProductsFilterDto) {
    return this.dashboardService.getTopProducts(filterDto);
  }

  @Get('recent-orders')
  getRecentOrders(@Query() filterDto: LimitFilterDto) {
    return this.dashboardService.getRecentOrders(filterDto);
  }
}
