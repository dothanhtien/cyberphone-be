import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/requests/create-brand.dto';
import { UpdateBrandDto } from './dto/requests/update-brand.dto';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { extractPaginationParams } from '@/common/utils/paginations.util';
import { sanitizeEntityInput } from '@/common/utils/entities';
import { normalizeSlug } from '@/common/utils/slugs';
import { MediaAssetsService } from '@/media-assets/media-assets.service';
import {
  MediaAsset,
  MediaType,
} from '@/media-assets/entities/media-asset.entity';
import { MediaAssetRefType } from '@/common/enums';
import { BRAND_FOLDER } from '@/common/constants/paths';
import { STORAGE_PROVIDER } from '@/storage/storage.module';
import type {
  StorageProvider,
  StorageUploadResult,
} from '@/storage/storage.provider';
import { PaginatedEntity } from '@/common/types/paginations.type';
import { BrandCreateEntityInput } from './dto/entity-inputs/brand-create-entity-input.dto';
import { BrandUpdateEntityInput } from './dto/entity-inputs/brand-update-entity-input.dto';
import { isUniqueConstraintError } from '@/common/utils/database-error.util';
import { BrandResponseDto } from './dto/responses/brand-response.dto';
import { mapToBrandResponse } from './mappers/brand.mapper';
import { BrandQueryRaw, BrandWithExtras } from './types';

@Injectable()
export class BrandsService {
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
    createBrandDto.slug = normalizeSlug(createBrandDto.slug);

    if (await this.doesSlugExist(createBrandDto.slug)) {
      throw new BadRequestException('Brand with this slug already exists');
    }

    return this.dataSource.transaction(async (tx) => {
      const brandEntity = sanitizeEntityInput(
        BrandCreateEntityInput,
        createBrandDto,
      );
      const savedBrand = await tx.save(Brand, brandEntity);

      let uploadResult: StorageUploadResult | null = null;
      let media: MediaAsset | null = null;

      try {
        if (logo) {
          uploadResult = await this.storageProvider.upload(logo, {
            folder: BRAND_FOLDER,
          });

          media = await this.mediaAssetsService.create(
            {
              publicId: uploadResult.key,
              url: uploadResult.url,
              resourceType: uploadResult.resourceType as MediaType,
              refType: MediaAssetRefType.BRAND,
              refId: savedBrand.id,
              createdBy: savedBrand.createdBy,
            },
            tx,
          );
        }

        return mapToBrandResponse({
          ...savedBrand,
          logo: media?.url ?? null,
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ConflictException('Brand with this slug already exists');
        }

        if (uploadResult?.key) {
          await this.storageProvider.delete(uploadResult.key);
        }
        throw error;
      }
    });
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<BrandResponseDto>> {
    const { page, limit } = extractPaginationParams(paginationQueryDto);

    const selectQueryBuilder = this.baseBrandQuery()
      .leftJoin('products', 'p', 'p.brand_id = b.id AND p.is_active = true')
      .select(['b', 'm.url AS logo'])
      .addSelect('COUNT(p.id)', 'productCount')
      .where('b.is_active = true')
      .groupBy('b.id, m.url')
      .orderBy('b.updated_at', 'DESC')
      .skip((page - 1) * limit)
      .limit(limit);

    const countQueryBuilder = selectQueryBuilder.clone();

    const [{ entities, raw }, totalCount] = await Promise.all([
      selectQueryBuilder.getRawAndEntities(),
      countQueryBuilder.getCount(),
    ]);

    const brands = this.mergeBrandExtras(entities, raw as BrandQueryRaw[]);

    return {
      items: brands.map(mapToBrandResponse),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string): Promise<BrandResponseDto> {
    const { entities, raw } = await this.baseBrandQuery()
      .select(['b', 'm.url AS logo'])
      .where('b.id = :id AND b.is_active = true', { id })
      .getRawAndEntities();

    if (!entities.length) {
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
    const brand = await this.brandRepository.findOne({
      where: { id, isActive: true },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (updateBrandDto.slug) {
      updateBrandDto.slug = normalizeSlug(updateBrandDto.slug);
    }

    if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      if (await this.doesSlugExist(updateBrandDto.slug, id)) {
        throw new BadRequestException('Slug already exists');
      }
    }

    return this.dataSource.transaction(async (tx) => {
      const updatedBrand = await tx.save(
        Brand,
        sanitizeEntityInput(BrandUpdateEntityInput, {
          ...brand,
          ...updateBrandDto,
        }),
      );

      let uploadResult: StorageUploadResult | null = null;
      let logoUrl: string | null = null;

      try {
        if (logo) {
          const oldMedia = await this.mediaAssetsService.findByRefId(
            MediaAssetRefType.BRAND,
            id,
            tx,
          );

          uploadResult = await this.storageProvider.upload(logo, {
            folder: BRAND_FOLDER,
          });

          const newMedia = await this.mediaAssetsService.create(
            {
              publicId: uploadResult.key,
              url: uploadResult.url,
              resourceType: uploadResult.resourceType as MediaType,
              refType: MediaAssetRefType.BRAND,
              refId: id,
              createdBy: updatedBrand.updatedBy,
            },
            tx,
          );

          logoUrl = newMedia.url;

          if (oldMedia) {
            await this.mediaAssetsService.deleteById(oldMedia.id, tx);

            if (oldMedia.publicId) {
              await this.storageProvider.delete(oldMedia.publicId);
            }
          }
        }

        return mapToBrandResponse({
          ...updatedBrand,
          logo: logoUrl,
        });
      } catch (error) {
        if (uploadResult?.key) {
          await this.storageProvider.delete(uploadResult.key);
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
        AND m.deleted_at IS NULL
      `,
      { refType: MediaAssetRefType.BRAND },
    );
  }

  private mergeBrandExtras(
    entities: Brand[],
    raw: BrandQueryRaw[],
  ): BrandWithExtras[] {
    return entities.map((brand, idx) => ({
      ...brand,
      logo: raw[idx]?.logo ?? null,
      productCount: Number(raw[idx]?.productCount ?? 0),
    }));
  }
}
