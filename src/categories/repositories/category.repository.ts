import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { CategoryCreateEntityDto, CategoryUpdateEntityDto } from '../dto';
import { Category } from '../entities';
import { CategoryRaw } from '../types';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';

export interface ICategoryRepository {
  create(data: CategoryCreateEntityDto, tx: EntityManager): Promise<Category>;
  update(
    id: string,
    data: CategoryUpdateEntityDto,
    tx: EntityManager,
  ): Promise<void>;
  findActiveById(id: string): Promise<Category | null>;
  findAllAndCount(
    limit: number,
    offset: number,
  ): Promise<[CategoryRaw[], number]>;
  fetchCategoryTree(id: string): Promise<Category[]>;
  existsActiveById(id: string): Promise<boolean>;
  existsActiveBySlug(slug: string, excludeId?: string): Promise<boolean>;
  findActiveByIds(ids: string[]): Promise<Pick<Category, 'id'>[]>;
  getDescendants(id: string): Promise<Pick<Category, 'id' | 'parentId'>[]>;
}

export const CATEGORY_REPOSITORY = Symbol('ICategoryRepository');

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  create(data: CategoryCreateEntityDto, tx: EntityManager): Promise<Category> {
    return tx.getRepository(Category).save(data);
  }

  async update(
    id: string,
    data: CategoryUpdateEntityDto,
    tx: EntityManager,
  ): Promise<void> {
    await tx.getRepository(Category).update(id, data);
  }

  findActiveById(id: string): Promise<Category | null> {
    return this.repository.findOne({ where: { id, isActive: true } });
  }

  findAllAndCount(
    limit: number,
    offset: number,
  ): Promise<[CategoryRaw[], number]> {
    const findAllQuery = this.repository
      .createQueryBuilder('c')
      .leftJoin(
        'media_assets',
        'm',
        `
        m.ref_type = :refType
        AND m.ref_id = c.id::text
        AND m.is_active = true
        AND m.usage_type = :usageType
        `,
        {
          refType: MediaAssetRefType.CATEGORY,
          usageType: MediaAssetUsageType.LOGO,
        },
      )
      .leftJoin('product_categories', 'pc', 'pc.category_id = c.id')
      .select([
        'c.id AS id',
        'c.name AS name',
        'c.slug AS slug',
        'c.description AS description',
        'c.parent_id AS parentId',
      ])
      .addSelect('m.url', 'logo')
      .addSelect('COUNT(pc.id)', 'productCount')
      .where('c.is_active = true')
      .groupBy('c.id, m.url')
      .orderBy('COALESCE(c.updated_at, c.created_at)', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany<CategoryRaw>();

    const countQuery = this.repository.count({ where: { isActive: true } });

    return Promise.all([findAllQuery, countQuery]);
  }

  fetchCategoryTree(id: string): Promise<Category[]> {
    return this.repository.query<Category[]>(
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

  existsActiveById(id: string): Promise<boolean> {
    return this.repository.exists({ where: { id, isActive: true } });
  }

  existsActiveBySlug(slug: string, excludeId?: string): Promise<boolean> {
    return this.repository.exists({
      where: {
        slug,
        isActive: true,
        ...(excludeId && { id: Not(excludeId) }),
      },
    });
  }

  findActiveByIds(ids: string[]): Promise<Pick<Category, 'id'>[]> {
    return this.repository.find({
      where: { id: In(ids), isActive: true },
      select: ['id'],
    });
  }

  getDescendants(id: string): Promise<Pick<Category, 'id' | 'parentId'>[]> {
    return this.repository.query<Pick<Category, 'id' | 'parentId'>[]>(
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
