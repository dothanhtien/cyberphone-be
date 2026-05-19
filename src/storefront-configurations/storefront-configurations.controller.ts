import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  GetStorefrontConfigurationsDto,
  SyncStorefrontConfigurationsDto,
} from './dto';
import { StorefrontConfigurationsService } from './storefront-configurations.service';
import { LoggedInUser, Public } from '@/auth/decorators';

@Controller('storefront-configurations')
export class StorefrontConfigurationsController {
  constructor(
    private readonly storefrontConfigurationsService: StorefrontConfigurationsService,
  ) {}

  @Public()
  @Get()
  getConfig(@Query() query: GetStorefrontConfigurationsDto) {
    return this.storefrontConfigurationsService.getStorefrontConfigurations(
      query,
    );
  }

  @Post()
  syncStorefrontConfigurations(
    @Body() dto: SyncStorefrontConfigurationsDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    return this.storefrontConfigurationsService.syncStorefrontConfigurations(
      dto,
      loggedInUserId,
    );
  }
}
