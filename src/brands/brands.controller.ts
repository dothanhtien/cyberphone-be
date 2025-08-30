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
import { BrandsService } from './brands.service';
import { NonEmptyBodyPipe } from 'src/validation/non-empty-body.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { GetBrandsDto } from './dto/get-brands.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

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

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateBrandDto: UpdateBrandDto,
    @CurrentUser() user: User,
  ) {
    updateBrandDto.updatedBy = user.id;
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  async deactiveBrand(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    await this.brandsService.update(id, {
      isActive: false,
      updatedBy: user.id,
    });
    return true;
  }
}
