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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { NonEmptyBodyPipe } from '@/common/pipes/non-empty-body.pipe';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  CreateCategoryWithLogoDto,
} from './dto/requests/create-category.dto';
import {
  UpdateCategoryDto,
  UpdateCategoryWithLogoDto,
} from './dto/requests/update-category.dto';
import { CategoryResponseDto } from './dto/responses/category-response.dto';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCategoryWithLogoDto })
  @ApiCreatedResponse({
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @UploadedFile() logo: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    createCategoryDto.createdBy = 'admin'; // TODO: replace with actual user
    return this.categoriesService.create(createCategoryDto, logo);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of categories (paginated)' })
  @ApiOkResponse({
    description: 'List of categories',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: getSchemaPath(CategoryResponseDto) },
        },
        totalCount: {
          type: 'number',
          example: 125,
          description: 'Total number of items',
        },
        currentPage: {
          type: 'number',
          example: 1,
          description: 'Current page number',
        },
        itemsPerPage: {
          type: 'number',
          example: 20,
          description: 'Number of items per page',
        },
      },
    },
  })
  findAll(@Query() query: PaginationQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Category detail',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCategoryWithLogoDto })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @UploadedFile() logo: Express.Multer.File,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateCategoryDto: UpdateCategoryDto,
  ) {
    updateCategoryDto.updatedBy = 'admin'; // TODO: replace with actual user
    return this.categoriesService.update(id, updateCategoryDto, logo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete category' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Category deleted successfully',
    schema: { example: true },
  })
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    await this.categoriesService.update(id, {
      isActive: false,
      updatedBy: 'admin', // TODO: replace with actual user
    });
    return true;
  }
}
