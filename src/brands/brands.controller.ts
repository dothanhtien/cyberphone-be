import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { NonEmptyBodyPipe } from 'src/validation/non-empty-body.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateBrandDto } from './dto/create-brand.dto';
import { GetBrandsDto } from './dto/get-brands.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  create(
    @Body(new NonEmptyBodyPipe()) createBrandDto: CreateBrandDto,
    @CurrentUser() user: User,
  ) {
    createBrandDto.createdBy = user.id;
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  findAll(@Query() query: GetBrandsDto) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.brandsService.findOne(id);
  }
}
