import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardSerVice: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardSerVice.getSummary();
  }

  @Get('revenue')
  getRevenue() {
    return this.dashboardSerVice.getRevenue();
  }

  @Get('top-category-sales')
  getTopCategorySales() {
    return this.dashboardSerVice.getTopCategorySales();
  }
}
