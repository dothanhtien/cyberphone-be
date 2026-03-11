import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DateRangeFilterDto, LimitFilterDto } from './dto/requests/filter.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardSerVice: DashboardService) {}

  @Get('summary')
  getSummary(@Query() filterDto: DateRangeFilterDto) {
    return this.dashboardSerVice.getSummary(filterDto);
  }

  @Get('revenue')
  getRevenue(@Query() filterDto: DateRangeFilterDto) {
    return this.dashboardSerVice.getRevenue(filterDto);
  }

  @Get('top-category-sales')
  getTopCategorySales(@Query() filterDto: DateRangeFilterDto) {
    return this.dashboardSerVice.getTopCategorySales(filterDto);
  }

  @Get('top-products')
  getTopProducts(@Query() filterDto: DateRangeFilterDto & LimitFilterDto) {
    return this.dashboardSerVice.getTopProducts(filterDto);
  }

  @Get('recent-orders')
  getRecentOrders(@Query() filterDto: LimitFilterDto) {
    return this.dashboardSerVice.getRecentOrders(filterDto);
  }
}
