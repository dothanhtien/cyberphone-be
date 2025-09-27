import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { PaginatedEntity } from '@/common/interfaces/pagination.interface';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { extractPaginationParams } from '@/common/utils/paginations.util';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    createCategoryDto.slug = createCategoryDto.slug.toLowerCase();
    const isSlugExist = await this.categoryRepository.exists({
      where: { slug: createCategoryDto.slug, isActive: true },
    });

    if (isSlugExist) {
      throw new BadRequestException('Slug already exists');
    }

    const newCategory = plainToInstance(Category, createCategoryDto, {
      excludeExtraneousValues: true,
    });

    return this.categoryRepository.save(newCategory);
  }

  async findAll(
    getCategoriesDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<Category>> {
    const { page, limit } = extractPaginationParams(getCategoriesDto);

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

  async findOne(id: string): Promise<Category | null> {
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

    const aliasedColumns = selectedFields
      .map((f) => `${f.raw} AS "${f.alias}"`)
      .join(', ');

    const rows = await this.categoryRepository.query<Category[]>(
      `
        WITH RECURSIVE category_tree AS (
          SELECT ${selectedFields.map((f) => f.raw).join(', ')}
          FROM categories
          WHERE id = $1 AND is_active = TRUE
          UNION ALL
          SELECT ${selectedFields.map((f) => `c.${f.raw}`).join(', ')}
          FROM categories c
          INNER JOIN category_tree ct ON ct.id = c.parent_id
          WHERE c.is_active = TRUE
        )
        SELECT ${aliasedColumns}
        FROM category_tree;
      `,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Category not found');
    }

    const map = new Map<string, Category>();
    for (const row of rows) {
      const category = plainToInstance(
        Category,
        { ...row, children: [] },
        { excludeExtraneousValues: true },
      );
      map.set(category.id, category);
    }

    for (const row of rows) {
      if (!row.parentId) continue;
      const child = map.get(row.id);
      const parent = map.get(row.parentId);
      if (child && parent) {
        parent.children.push(child);
      }
    }

    const result = map.get(id)!;

    if (result.parentId) {
      result.parent =
        (await this.categoryRepository.findOne({
          where: { id: result.parentId, isActive: true },
        })) ?? undefined;
    }

    return result;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.slug) {
      updateCategoryDto.slug = updateCategoryDto.slug.toLowerCase();
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug, isActive: true },
        select: ['id'],
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException('Slug already exists');
      }
    }

    if (updateCategoryDto.removeLogo) {
      updateCategoryDto.logoUrl = null;
    } else if (updateCategoryDto.logoUrl === undefined) {
      updateCategoryDto.logoUrl = category.getLogoPath();
    }

    const parentId = updateCategoryDto.parentId;
    if (parentId && parentId !== category.parentId) {
      if (parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parentId, isActive: true },
      });
      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
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
      { ...category, ...updateCategoryDto },
      { excludeExtraneousValues: true },
    );

    return this.categoryRepository.save(updatedCategory);
  }

  async getDescendants(id: string) {
    const categories = await this.categoryRepository.query<
      Pick<Category, 'id' | 'parentId'>[]
    >(
      `
      WITH RECURSIVE category_tree AS (
        SELECT id, parent_id FROM categories WHERE id = $1 AND is_active = TRUE
        UNION ALL
        SELECT c.id, c.parent_id FROM categories c
        INNER JOIN category_tree ct ON ct.id = c.parent_id
        WHERE c.is_active = TRUE
      )
      SELECT id, parent_id AS "parentId" FROM category_tree WHERE id != $1;
    `,
      [id],
    );

    return categories;
  }

  async getLogoPath(id: string): Promise<string | null> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });
    return category?.getLogoPath() ?? null;
  }
}
