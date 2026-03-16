import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import {
  BrandCreateEntityInput,
  BrandResponseDto,
  BrandUpdateEntityInput,
  CreateBrandDto,
  UpdateBrandDto,
} from './dto';
import { Brand } from './entities';
import { mapToBrandResponse } from './mappers';
import { BrandQueryRaw, BrandWithExtras } from './types';
import { MediaAssetsService } from '@/media/media-assets.service';
import { MediaAsset } from '@/media/entities';
import { STORAGE_PROVIDER } from '@/storage/storage.module';
import type {
  StorageProvider,
  StorageUploadResult,
} from '@/storage/storage.provider';
import { BRAND_FOLDER } from '@/common/constants';
import { PaginationQueryDto } from '@/common/dto';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';
import { PaginatedEntity } from '@/common/types';
import {
  extractPaginationParams,
  getErrorStack,
  isUniqueConstraintError,
  normalizeSlug,
  sanitizeEntityInput,
} from '@/common/utils';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly dataSource: DataSource,
    private readonly mediaAssetsService: MediaAssetsService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider,
  ) {}

  async create(
    createBrandDto: CreateBrandDto,
    logo?: Express.Multer.File,
  ): Promise<BrandResponseDto> {
    this.logger.log(`Creating brand: ${createBrandDto.name}`);

    createBrandDto.slug = normalizeSlug(createBrandDto.slug);

    if (await this.doesSlugExist(createBrandDto.slug)) {
      this.logger.warn(`Brand slug already exists: ${createBrandDto.slug}`);
      throw new BadRequestException('Brand with this slug already exists');
    }

    return this.dataSource.transaction(async (tx) => {
      const brandEntity = sanitizeEntityInput(
        BrandCreateEntityInput,
        createBrandDto,
      );

      const savedBrand = await tx.save(Brand, brandEntity);

      this.logger.debug(`Brand saved with id=${savedBrand.id}`);

      let uploadResult: StorageUploadResult | null = null;
      let media: MediaAsset | null = null;

      try {
        if (logo) {
          this.logger.debug(`Uploading logo for brand ${savedBrand.id}`);

          uploadResult = await this.storageProvider.upload(logo, {
            folder: BRAND_FOLDER,
          });

          media = await this.mediaAssetsService.create(
            {
              publicId: uploadResult.key,
              url: uploadResult.url,
              resourceType: uploadResult.resourceType,
              refType: MediaAssetRefType.BRAND,
              refId: savedBrand.id,
              usageType: MediaAssetUsageType.LOGO,
              createdBy: savedBrand.createdBy,
            },
            tx,
          );

          this.logger.debug(
            `Logo uploaded for brand ${savedBrand.id} - key=${uploadResult.key}`,
          );
        }

        return mapToBrandResponse({
          ...savedBrand,
          logo: media?.url ?? null,
        });
      } catch (error) {
        this.logger.error(
          `Failed to create brand ${createBrandDto.name}`,
          getErrorStack(error),
        );

        if (isUniqueConstraintError(error)) {
          throw new ConflictException('Brand with this slug already exists');
        }

        if (uploadResult?.key) {
          await this.storageProvider.delete(uploadResult.key);
          this.logger.warn(`Rolled back uploaded file ${uploadResult.key}`);
        }

        throw error;
      }
    });
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<BrandResponseDto>> {
    const { page, limit } = extractPaginationParams(paginationQueryDto);

    this.logger.debug(`Fetching brands page=${page} limit=${limit}`);

    const selectQueryBuilder = this.baseBrandQuery()
      .leftJoin('products', 'p', 'p.brand_id = b.id AND p.is_active = true')
      .select([
        'b.id AS id',
        'b.name AS name',
        'b.slug AS slug',
        'b.is_active AS "isActive"',
        'b.created_at AS "createdAt"',
        'b.created_by AS "createdBy"',
        'b.updated_at AS "updatedAt"',
        'b.updated_by AS "updatedBy"',
      ])
      .addSelect('m.url', 'logo')
      .addSelect('COUNT(p.id)', 'productCount')
      .where('b.is_active = true')
      .groupBy('b.id, m.url')
      .orderBy('COALESCE(b.updated_at, b.created_at)', 'DESC')
      .skip((page - 1) * limit)
      .limit(limit);

    const countQueryBuilder = selectQueryBuilder.clone();

    const [rows, totalCount] = await Promise.all([
      selectQueryBuilder.getRawMany(),
      countQueryBuilder.getCount(),
    ]);

    this.logger.debug(`Fetched ${rows.length} brands`);

    return {
      items: rows.map(mapToBrandResponse),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string): Promise<BrandResponseDto> {
    this.logger.debug(`Fetching brand id=${id}`);

    const { entities, raw } = await this.baseBrandQuery()
      .select(['b', 'm.url AS logo'])
      .where('b.id = :id AND b.is_active = true', { id })
      .getRawAndEntities();

    if (!entities.length) {
      this.logger.warn(`Brand not found id=${id}`);
      throw new NotFoundException('Brand not found');
    }

    const brand = this.mergeBrandExtras(entities, raw as BrandQueryRaw[])[0];

    return mapToBrandResponse(brand);
  }

  async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
    logo?: Express.Multer.File,
  ): Promise<BrandResponseDto> {
    this.logger.log(`Updating brand id=${id}`);

    const brand = (await this.brandRepository
      .createQueryBuilder('brand')
      .select(['brand'])
      .where('brand.id = :id AND brand.isActive = true', { id })
      .loadRelationCountAndMap('brand.productCount', 'brand.products')
      .getOne()) as Brand & { productCount: number };

    if (!brand) {
      this.logger.warn(`Brand not found id=${id}`);
      throw new NotFoundException('Brand not found');
    }

    if (updateBrandDto.slug) {
      updateBrandDto.slug = normalizeSlug(updateBrandDto.slug);
    }

    if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      if (await this.doesSlugExist(updateBrandDto.slug, id)) {
        this.logger.warn(`Slug already exists: ${updateBrandDto.slug}`);
        throw new BadRequestException('Slug already exists');
      }
    }

    return this.dataSource.transaction(async (tx) => {
      const entityInput = sanitizeEntityInput(BrandUpdateEntityInput, {
        ...brand,
        ...updateBrandDto,
      });

      if (updateBrandDto.isActive === false) {
        if (brand.productCount > 0) {
          this.logger.warn(
            `Cannot delete brand id=${id} because it has products`,
          );
          throw new BadRequestException(
            'Cannot delete brand with existing products',
          );
        }

        entityInput.isActive = false;
        this.logger.debug(`Setting brand id=${id} as inactive`);
      }

      this.logger.debug(
        `Update payload for brand ${id}: ${JSON.stringify(entityInput)}`,
      );

      const updatedBrand = await tx.save(Brand, { id, ...entityInput });

      this.logger.debug(`Brand updated id=${updatedBrand.id}`);

      let uploadResult: StorageUploadResult | null = null;
      let logoUrl: string | null = null;

      try {
        // important: Before uploading a logo, we need to retrieve oldMedia to identify differences with newMedia
        const oldLogo = await this.mediaAssetsService.findByRefId({
          refType: MediaAssetRefType.BRAND,
          refId: id,
          usageType: MediaAssetUsageType.LOGO,
          tx,
        });

        const shouldRemoveOld = updateBrandDto.removeLogo || !!logo;

        if (logo) {
          this.logger.debug(`Uploading new logo for brand ${id}`);

          uploadResult = await this.storageProvider.upload(logo, {
            folder: BRAND_FOLDER,
          });

          const newLogo = await this.mediaAssetsService.create(
            {
              publicId: uploadResult.key,
              url: uploadResult.url,
              resourceType: uploadResult.resourceType,
              refType: MediaAssetRefType.BRAND,
              refId: id,
              usageType: MediaAssetUsageType.LOGO,
              createdBy: updatedBrand.updatedBy,
            },
            tx,
          );

          logoUrl = newLogo.url;
        }

        if (shouldRemoveOld && oldLogo) {
          await tx.save(Brand, { id, ...entityInput });
          try {
            await this.mediaAssetsService.deleteById(oldLogo.id, tx);
            if (oldLogo.publicId) {
              await this.storageProvider.delete(oldLogo.publicId);
              this.logger.debug(`Deleted old logo ${oldLogo.publicId}`);
            }
          } catch (err) {
            this.logger.error(
              `Failed to delete old logo ${oldLogo.publicId}: ${getErrorStack(err)}`,
            );
          }
        }

        if (!logo && updateBrandDto.removeLogo) {
          logoUrl = null;
        } else if (!logo && !updateBrandDto.removeLogo) {
          logoUrl = oldLogo?.url ?? null;
        }

        return mapToBrandResponse({
          ...updatedBrand,
          logo: logoUrl,
        });
      } catch (error) {
        this.logger.error(`Failed updating brand ${id}`, getErrorStack(error));

        if (uploadResult?.key) {
          await this.storageProvider.delete(uploadResult.key);
          this.logger.warn(`Rolled back uploaded file ${uploadResult.key}`);
        }

        throw error;
      }
    });
  }

  async exists(id: string): Promise<boolean> {
    return this.brandRepository.exists({
      where: {
        id,
        isActive: true,
      },
    });
  }

  private doesSlugExist(slug: string, excludeId?: string) {
    return this.brandRepository.exists({
      where: {
        slug,
        isActive: true,
        ...(excludeId && { id: Not(excludeId) }),
      },
    });
  }

  private baseBrandQuery() {
    return this.brandRepository.createQueryBuilder('b').leftJoin(
      'media_assets',
      'm',
      `
        m.ref_type = :refType 
        AND m.ref_id::uuid = b.id 
        AND m.is_active = true
        AND m.usage_type = :usageType
      `,
      { refType: MediaAssetRefType.BRAND, usageType: MediaAssetUsageType.LOGO },
    );
  }

  private mergeBrandExtras(
    entities: Brand[],
    raw: BrandQueryRaw[],
  ): BrandWithExtras[] {
    return entities.map((brand, idx) => ({
      ...brand,
      logo: raw[idx]?.logo ?? null,
      productCount: Number(raw[idx]?.product_count ?? 0),
    }));
  }
}
