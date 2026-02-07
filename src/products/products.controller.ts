import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/requests/create-product.dto';
import { UpdateProductDto } from './dto/requests/update-product.dto';
import { LoggedInUser } from '@/auth/decorators/logged-in-user.decorator';
import { User } from '@/users/entities/user.entity';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @LoggedInUser() loggedInUser: User,
  ) {
    createProductDto.createdBy = loggedInUser.id;
    return this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @LoggedInUser() loggedInUser: User,
  ) {
    updateProductDto.updatedBy = loggedInUser.id;
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @LoggedInUser() loggedInUser: User,
  ) {
    await this.productsService.update(id, {
      isActive: false,
      updatedBy: loggedInUser.id,
    });

    return true;
  }
}
