import { Body, Controller, Post } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    console.log({ createCategoryDto });

    return true;
  }
}
