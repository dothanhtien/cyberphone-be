import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { plainToInstance } from 'class-transformer';
import { PaginatedEntity } from 'src/common/interfaces';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = createCategoryDto.slug.toLowerCase();
    const category = await this.categoryRepository.findOne({
      where: { slug },
      select: { isActive: true },
    });

    if (category && category.isActive) {
      throw new BadRequestException('Slug already exists');
    }
    // in case a category is inactive, add the property isActive = true
    // if it is null, it can still be assigned to the object without error

    const newCategory = plainToInstance(
      Category,
      {
        ...category,
        isActive: true,
        ...createCategoryDto,
      },
      {
        excludeExtraneousValues: true,
      },
    );

    return this.categoryRepository.save(newCategory);
  }

  async findAll(
    getCategoriesDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<Category>> {
    const page = getCategoriesDto.page || 1;
    const limit = getCategoriesDto.limit || 10;

    const [categories, totalCount] = await this.categoryRepository.findAndCount(
      {
        where: { isActive: true },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      },
    );

    return {
      items: categories,
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    const selectedFields = [
      { raw: 'id', alias: 'id' },
      { raw: 'name', alias: 'name' },
      { raw: 'slug', alias: 'slug' },
      { raw: 'description', alias: 'description' },
      { raw: 'logo_url', alias: 'logoUrl' },
      { raw: 'parent_id', alias: 'parentId' },
      { raw: 'is_active', alias: 'isActive' },
      { raw: 'created_at', alias: 'createdAt' },
      { raw: 'created_by', alias: 'createdBy' },
      { raw: 'updated_at', alias: 'updatedAt' },
      { raw: 'updated_by', alias: 'updatedBy' },
    ];
    const rows = await this.categoryRepository.query<Category[]>(
      `
      WITH RECURSIVE category_tree AS (
        SELECT
          ${selectedFields.map((f) => f.raw).join(', ')}
        FROM categories
        WHERE id = $1
        UNION ALL
        SELECT 
          ${selectedFields.map((f) => `c.${f.raw}`).join(', ')}
        FROM categories c
        INNER JOIN category_tree ct ON ct.id = c.parent_id
      )
      SELECT
        ${selectedFields.map((f) => `${f.raw} AS "${f.alias}"`).join(', ')}
      FROM category_tree;
    `,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Category not found');
    }

    const map = new Map<string, Category>();
    let rootCategory: Category | null = null;

    rows.forEach((row) => {
      const category = plainToInstance(
        Category,
        { ...row, children: [] },
        {
          excludeExtraneousValues: true,
        },
      );

      map.set(category.id, category);
    });

    rows.forEach((row) => {
      const cat = map.get(row.id)!;
      if (row.parentId) {
        const parent = map.get(row.parentId)!;
        parent.children.push(cat);
      } else {
        rootCategory = map.get(row.id)!;
      }
    });

    return rootCategory;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.slug) {
      updateCategoryDto.slug = updateCategoryDto.slug.toLowerCase();
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
        select: ['id', 'isActive'],
      });

      if (existing && existing.id !== id) {
        if (existing.isActive) {
          throw new BadRequestException('Slug already exists');
        } else {
          throw new BadRequestException(
            'Slug already exists in an inactive category',
          );
        }
      }
    }

    const parentId = updateCategoryDto.parentId;
    if (parentId && parentId !== category.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parentId, isActive: true },
      });

      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
      }

      if (parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const descendants = await this.getDescendants(id);
      if (descendants.some((d) => d.id === parentId)) {
        throw new BadRequestException(
          'Cannot set a descendant as parent category',
        );
      }
    }

    const updatedCategory = plainToInstance(
      Category,
      {
        ...category,
        isActive: true,
        ...updateCategoryDto,
      },
      {
        excludeExtraneousValues: true,
      },
    );

    return this.categoryRepository.save(updatedCategory);
  }

  async getDescendants(id: string) {
    const categories = await this.categoryRepository.query<
      Pick<Category, 'id' | 'parentId'>[]
    >(
      `
      WITH RECURSIVE category_tree AS (
        SELECT id, parent_id FROM categories WHERE id = $1
        UNION ALL
        SELECT c.id, c.parent_id FROM categories c
        INNER JOIN category_tree ct ON ct.id = c.parent_id
      )
      SELECT id, parent_id AS "parentId" FROM category_tree WHERE id != $1;
    `,
      [id],
    );

    return categories;
  }
}
