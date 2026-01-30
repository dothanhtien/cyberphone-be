import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from '@/common/dtos/paginations.dto';
import { extractPaginationParams } from '@/common/utils/paginations.util';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    createCategoryDto.slug = this.normalizeSlug(createCategoryDto.slug);

    if (await this.doesSlugExist(createCategoryDto.slug)) {
      throw new BadRequestException('Category with this slug already exists');
    }

    const newCategory = this.toEntity(Category, createCategoryDto);

    return this.categoryRepository.save(newCategory);
  }

  async findAll(paginationQueryDto: PaginationQueryDto) {
    const { page, limit } = extractPaginationParams(paginationQueryDto);

    const [items, totalCount] = await this.categoryRepository.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string): Promise<Category | null> {
    const rows = await this.fetchCategoryTree(id);

    if (!rows.length) {
      throw new NotFoundException('Category not found');
    }

    const result = this.buildCategoryTree(rows, id);

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
      where: {
        id,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.slug) {
      updateCategoryDto.slug = this.normalizeSlug(updateCategoryDto.slug);
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      if (await this.doesSlugExist(updateCategoryDto.slug, id)) {
        throw new BadRequestException('Slug already exists');
      }
    }

    await this.validateParentChange(
      id,
      category.parentId,
      updateCategoryDto.parentId,
    );

    if (updateCategoryDto.isActive === false && category.isActive) {
      const descendants = await this.getDescendants(id);
      if (descendants.length) {
        throw new BadRequestException(
          'Cannot deactivate category with descendants',
        );
      }
    }

    return this.categoryRepository.save(
      this.toEntity(Category, { ...category, ...updateCategoryDto }),
    );
  }

  private normalizeSlug(slug: string) {
    return slug.trim().toLowerCase();
  }

  private doesSlugExist(slug: string, excludeId?: string) {
    return this.categoryRepository.exists({
      where: {
        slug,
        isActive: true,
        ...(excludeId && { id: Not(excludeId) }),
      },
    });
  }

  private toEntity<T>(entityClass: new () => T, data: unknown): T {
    return plainToInstance(entityClass, data, {
      excludeExtraneousValues: true,
    });
  }

  private async fetchCategoryTree(id: string): Promise<Category[]> {
    return this.categoryRepository.query<Category[]>(
      `
      WITH RECURSIVE category_tree AS (
        SELECT
          id, name, slug, description,
          parent_id AS "parentId",
          is_active AS "isActive",
          created_at AS "createdAt",
          created_by AS "createdBy",
          updated_at AS "updatedAt",
          updated_by AS "updatedBy"
        FROM categories
        WHERE id = $1 AND is_active = TRUE
        UNION ALL
        SELECT
          c.id, c.name, c.slug, c.description,
          c.parent_id, c.is_active,
          c.created_at, c.created_by,
          c.updated_at, c.updated_by
        FROM categories c
        INNER JOIN category_tree ct ON ct.id = c.parent_id
        WHERE c.is_active = TRUE
      )
      SELECT * FROM category_tree;
    `,
      [id],
    );
  }

  private buildCategoryTree(rows: Category[], rootId: string): Category {
    const map = new Map<string, Category>();

    for (const row of rows) {
      const category = this.toEntity(Category, { ...row, children: [] });
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

    return map.get(rootId)!;
  }

  private async validateParentChange(
    id: string,
    currentParentId?: string,
    newParentId?: string,
  ) {
    if (!newParentId || newParentId === currentParentId) return;

    if (newParentId === id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    const parentExists = await this.categoryRepository.exists({
      where: { id: newParentId, isActive: true },
    });

    if (!parentExists) {
      throw new BadRequestException('Parent category not found');
    }

    const descendants = await this.getDescendants(id);
    if (descendants.some((d) => d.id === newParentId)) {
      throw new BadRequestException(
        'Cannot set a descendant as parent category',
      );
    }
  }

  private async getDescendants(id: string) {
    return this.categoryRepository.query<Pick<Category, 'id' | 'parentId'>[]>(
      `
        WITH RECURSIVE category_tree AS (
          SELECT id, parent_id FROM categories WHERE id = $1 AND is_active = TRUE
          UNION ALL
          SELECT c.id, c.parent_id
          FROM categories c
          INNER JOIN category_tree ct ON ct.id = c.parent_id
          WHERE c.is_active = TRUE
        )
        SELECT id, parent_id AS "parentId" 
        FROM category_tree 
        WHERE id != $1;
      `,
      [id],
    );
  }
}
