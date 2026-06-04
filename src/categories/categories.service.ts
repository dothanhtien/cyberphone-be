import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CategoryCreateEntityDto,
  CategoryUpdateEntityDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';
import { Category } from './entities';
import { CategoryMapper } from './mappers';
import { type ICategoryRepository, CATEGORY_REPOSITORY } from './repositories';
import { CATEGORY_FOLDER } from '@/common/constants';
import { PaginationQueryDto } from '@/common/dto';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';
import {
  buildPaginationParams,
  extractPaginationParams,
  sanitizeEntityInput,
} from '@/common/utils';
import { MediaAssetsService } from '@/media/media-assets.service';
import { STORAGE_PROVIDER } from '@/storage/storage.module';
import type {
  StorageProvider,
  StorageUploadResult,
} from '@/storage/storage.provider';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly mediaAssetService: MediaAssetsService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    logo?: Express.Multer.File,
  ) {
    createCategoryDto.slug = this.normalizeSlug(createCategoryDto.slug);

    this.logger.debug(
      `[create] Creating category slug=${createCategoryDto.slug}`,
    );

    if (
      await this.categoryRepository.existsActiveBySlug(createCategoryDto.slug)
    ) {
      this.logger.warn(
        `[create] Duplicate slug slug=${createCategoryDto.slug}`,
      );
      throw new BadRequestException('Category with this slug already exists');
    }

    return this.dataSource.transaction(async (tx) => {
      const entity = sanitizeEntityInput(
        CategoryCreateEntityDto,
        createCategoryDto,
      );

      const savedCategory = await this.categoryRepository.create(entity, tx);

      let uploadResult: StorageUploadResult | null = null;

      try {
        if (logo) {
          this.logger.debug(
            `[create] Uploading logo slug=${savedCategory.slug}`,
          );
          uploadResult = await this.storageProvider.upload(logo, {
            folder: CATEGORY_FOLDER,
          });

          await this.mediaAssetService.create(
            [
              {
                publicId: uploadResult.key,
                url: uploadResult.url,
                resourceType: uploadResult.resourceType,
                refType: MediaAssetRefType.CATEGORY,
                refId: savedCategory.id,
                usageType: MediaAssetUsageType.LOGO,
                createdBy: savedCategory.createdBy,
              },
            ],
            tx,
          );
        }

        this.logger.debug(
          `[create] Created category successful id=${savedCategory.id}, slug=${savedCategory.slug}`,
        );

        return { id: savedCategory.id };
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
    const { skip } = buildPaginationParams(page, limit);

    this.logger.debug(
      `[findAll] Fetching categories page=${page}, limit=${limit}`,
    );

    const [items, totalCount] = await this.categoryRepository.findAllAndCount(
      limit,
      skip,
    );

    this.logger.debug(
      `[findAll] Fetched categories successful count=${items.length}, totalCount=${totalCount}`,
    );

    return {
      items: items.map((i) => CategoryMapper.mapToCategoryResponse(i)),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string): Promise<Category | null> {
    this.logger.debug(`[findOne] Fetching category id=${id}`);

    const rows = await this.categoryRepository.fetchCategoryTree(id);

    if (!rows.length) {
      this.logger.debug(`[findOne] Category not found id=${id}`);
      throw new NotFoundException('Category not found');
    }

    const result = this.buildCategoryTree(rows, id);

    if (result.parentId) {
      result.parent =
        (await this.categoryRepository.findActiveById(result.parentId)) ?? null;
    }

    this.logger.debug(`[findOne] Fetched category successful id=${id}`);

    return result;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    logo?: Express.Multer.File,
  ) {
    this.logger.debug(`[update] Updating category id=${id}`);

    const category = await this.categoryRepository.findActiveById(id);

    if (!category) {
      this.logger.debug(`[update] Category not found id=${id}`);
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.slug) {
      updateCategoryDto.slug = this.normalizeSlug(updateCategoryDto.slug);
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      if (
        await this.categoryRepository.existsActiveBySlug(
          updateCategoryDto.slug,
          id,
        )
      ) {
        this.logger.warn(
          `[update] Duplicate slug id=${id}, slug=${updateCategoryDto.slug}`,
        );
        throw new BadRequestException('Slug already exists');
      }
    }

    await this.validateParentChange(
      id,
      category.parentId,
      updateCategoryDto.parentId,
    );

    if (updateCategoryDto.isActive === false && category.isActive) {
      const descendants = await this.categoryRepository.getDescendants(id);
      if (descendants.length) {
        throw new BadRequestException(
          'Cannot deactivate category with descendants',
        );
      }
    }

    await this.dataSource.transaction(async (tx) => {
      await this.categoryRepository.update(
        id,
        sanitizeEntityInput(CategoryUpdateEntityDto, {
          ...category,
          ...updateCategoryDto,
        }),
        tx,
      );

      let uploadResult: StorageUploadResult | null = null;

      try {
        if (logo) {
          const oldMedia = await this.mediaAssetService.findByRefId({
            refType: MediaAssetRefType.CATEGORY,
            refId: id,
            usageType: MediaAssetUsageType.LOGO,
            tx,
          });

          uploadResult = await this.storageProvider.upload(logo, {
            folder: CATEGORY_FOLDER,
          });

          await this.mediaAssetService.create(
            [
              {
                publicId: uploadResult.key,
                url: uploadResult.url,
                resourceType: uploadResult.resourceType,
                refType: MediaAssetRefType.CATEGORY,
                refId: id,
                usageType: MediaAssetUsageType.LOGO,
                createdBy: updateCategoryDto.updatedBy,
              },
            ],
            tx,
          );

          if (oldMedia) {
            await this.mediaAssetService.deleteById(oldMedia.id, tx);
          }

          if (oldMedia?.publicId) {
            await this.storageProvider.delete(oldMedia.publicId);
          }
        }

        this.logger.debug(`[update] Updated category successful id=${id}`);
      } catch (error) {
        if (uploadResult?.key) {
          await this.storageProvider.delete(uploadResult.key);
        }
        throw error;
      }
    });

    return true;
  }

  findActiveByIds(ids: string[]): Promise<Pick<Category, 'id'>[]> {
    if (!ids.length) {
      return Promise.resolve([]);
    }

    return this.categoryRepository.findActiveByIds(ids);
  }

  private normalizeSlug(slug: string) {
    return slug.trim().toLowerCase();
  }

  private buildCategoryTree(rows: Category[], rootId: string): Category {
    const map = new Map<string, Category>();

    for (const row of rows) {
      const category = { ...row, children: [] };
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
    currentParentId: string | null,
    newParentId?: string,
  ) {
    if (!newParentId || newParentId === currentParentId) return;

    if (newParentId === id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    const parentExists =
      await this.categoryRepository.existsActiveById(newParentId);

    if (!parentExists) {
      throw new BadRequestException('Parent category not found');
    }

    const descendants = await this.categoryRepository.getDescendants(id);
    if (descendants.some((d) => d.id === newParentId)) {
      throw new BadRequestException(
        'Cannot set a descendant as parent category',
      );
    }
  }
}
