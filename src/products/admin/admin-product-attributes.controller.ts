import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { AdminProductAttributesService } from './admin-product-attributes.service';
import { Roles } from '@/auth/decorators';
import { UserRole } from '@/users/enums';

@Roles(UserRole.ADMIN)
@Controller('admin/products')
export class AdminProductAttributesController {
  constructor(
    private readonly productAttributesService: AdminProductAttributesService,
  ) {}

  @Get(':id/attributes')
  async find(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productAttributesService.findActiveByProductId(id);
  }
}
