import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CustomersService } from '../customers.service';
import { UpdateCustomerDto } from '../dto';
import { LoggedInUser, Roles } from '@/auth/decorators';
import { PaginationQueryDto } from '@/common/dto';
import { NonEmptyBodyPipe } from '@/common/pipes';
import { UserRole } from '@/users/enums';

@Roles(UserRole.ADMIN)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateCustomerDto: UpdateCustomerDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    updateCustomerDto.updatedBy = loggedInUserId;
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    await this.customersService.deactivate(id, loggedInUserId);
  }
}
