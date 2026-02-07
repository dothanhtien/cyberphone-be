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
import { ProductVariantsService } from './product-variants.service';
import { LoggedInUser } from '@/auth/decorators/logged-in-user.decorator';
import { User } from '@/users/entities/user.entity';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { CreateProductVariantDto } from './dto/requests/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/requests/update-product-variant.dto';

@Controller('product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post()
  async create(
    @Body() createProductVariantDto: CreateProductVariantDto,
    @LoggedInUser() LoggedInUser: User,
  ) {
    createProductVariantDto.createdBy = LoggedInUser.id;

    return this.productVariantsService.create(createProductVariantDto);
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.productVariantsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
    @LoggedInUser() loggedInUser: User,
  ) {
    updateProductVariantDto.updatedBy = loggedInUser.id;

    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @LoggedInUser() loggedInUser: User,
  ) {
    await this.productVariantsService.update(id, {
      isActive: false,
      updatedBy: loggedInUser.id,
    });

    return true;
  }
}
