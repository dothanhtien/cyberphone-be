import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import {
  buildPaginationParams,
  extractPaginationParams,
} from '@/common/utils/paginations.util';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { toEntity } from '@/common/utils/entities';
import { MediaAssetsService } from '@/media-assets/media-assets.service';
import {
  MediaAsset,
  MediaType,
} from '@/media-assets/entities/media-asset.entity';
import { MediaAssetRefType } from '@/common/enums';
import { CATEGORY_FOLDER } from '@/common/constants/paths';
import { STORAGE_PROVIDER } from '@/storage/storage.module';
import type {
  StorageProvider,
  StorageUploadResult,
} from '@/storage/storage.provider';
import { CategoryWithLogo } from '@/common/types/categories.type';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
    private readonly mediaAssetService: MediaAssetsService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    logo?: Express.Multer.File,
  ) {
    createCategoryDto.slug = this.normalizeSlug(createCategoryDto.slug);

    if (await this.doesSlugExist(createCategoryDto.slug)) {
      throw new BadRequestException('Category with this slug already exists');
    }

    return this.dataSource.transaction(async (tx) => {
      const category = toEntity(Category, createCategoryDto);
      const savedCategory = await tx.save(category);

      let uploadResult: StorageUploadResult | null = null;
      let media: MediaAsset | null = null;

      try {
        if (logo) {
          uploadResult = await this.storageProvider.upload(logo, {
            folder: CATEGORY_FOLDER,
          });

          media = await this.mediaAssetService.create(
            {
              publicId: uploadResult.key,
              url: uploadResult.url,
              resourceType: uploadResult.resourceType as MediaType,
              refType: MediaAssetRefType.CATEGORY,
              refId: savedCategory.id,
              createdBy: savedCategory.createdBy,
            },
            tx,
          );
        }

        return {
          ...savedCategory,
          logo: media?.url ?? null,
        };
      } catch (error) {
        if (uploadResult?.key) {
          await this.storageProvider.delete(uploadResult.key);
        }
        throw error;
      }
    });
  }

  async findAll(paginationQueryDto: PaginationQueryDto) {
    const { page, limit } = extractPaginationParams(paginationQueryDto);

    const [items, totalCount] = await this.categoryRepository.findAndCount({
      where: { isActive: true },
      ...buildPaginationParams(page, limit),
      order: { createdAt: 'DESC' },
    });

    const itemsWithLogo = await this.attachCategoryLogos(items);

    return {
      items: itemsWithLogo,
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

    return this.attachLogosToTree(result);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    logo?: Express.Multer.File,
  ) {
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

    return this.dataSource.transaction(async (tx) => {
      const updatedCategory = await tx.save(
        toEntity(Category, { ...category, ...updateCategoryDto }),
      );

      let uploadResult: StorageUploadResult | null = null;

      try {
        if (logo) {
          const oldMedia = await this.mediaAssetService.findByRefId(
            MediaAssetRefType.CATEGORY,
            id,
            tx,
          );

          uploadResult = await this.storageProvider.upload(logo, {
            folder: CATEGORY_FOLDER,
          });

          const newMedia = await this.mediaAssetService.create(
            {
              publicId: uploadResult.key,
              url: uploadResult.url,
              resourceType: uploadResult.resourceType as MediaType,
              refType: MediaAssetRefType.CATEGORY,
              refId: id,
              createdBy: updateCategoryDto.updatedBy,
            },
            tx,
          );

          if (oldMedia) {
            await this.mediaAssetService.deleteById(oldMedia.id, tx);
          }

          if (oldMedia?.publicId) {
            await this.storageProvider.delete(oldMedia.publicId);
          }

          return {
            ...updatedCategory,
            logo: newMedia.url,
          };
        }

        return (await this.attachCategoryLogos([updatedCategory]))[0];
      } catch (error) {
        if (uploadResult?.key) {
          await this.storageProvider.delete(uploadResult.key);
        }
        throw error;
      }
    });
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
      const category = toEntity(Category, { ...row, children: [] });
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

  private async attachCategoryLogos<T extends { id: string }>(
    categories: T[],
  ): Promise<(T & { logo: string | null })[]> {
    if (!categories.length) return [];

    const ids = categories.map((c) => c.id);

    const medias = await this.mediaAssetService.findByRefIds(
      MediaAssetRefType.CATEGORY,
      ids,
    );

    const mediaMap = new Map(medias.map((m) => [m.refId, m.url]));

    return categories.map((c) => ({
      ...c,
      logo: mediaMap.get(c.id) ?? null,
    }));
  }

  private async attachLogosToTree(
    category: Category,
  ): Promise<CategoryWithLogo> {
    const flat: Category[] = [];

    const collect = (node: Category) => {
      flat.push(node);
      node.children?.forEach(collect);
    };

    collect(category);

    const withLogos = await this.attachCategoryLogos(flat);
    const map = new Map<string, CategoryWithLogo>(
      withLogos.map((c) => [
        c.id,
        { ...c, children: [] as CategoryWithLogo[] } as CategoryWithLogo,
      ]),
    );

    const rebuild = (node: Category): CategoryWithLogo => {
      const current = map.get(node.id);

      if (!current) {
        throw new Error(`Category ${node.id} not found in logo map`);
      }

      return {
        ...current,
        children: node.children?.map(rebuild) ?? [],
      } as CategoryWithLogo;
    };

    return rebuild(category);
  }
}
