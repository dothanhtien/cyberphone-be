import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationQueryDto } from '@/common/dto/paginations.dto';
import { extractPaginationParams } from '@/common/utils/paginations.util';
import { toEntity } from '@/common/utils/entities';
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
import { BrandWithLogo } from '@/common/types/brands.type';
import { PaginatedEntity } from '@/common/types/paginations.type';

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
  ): Promise<BrandWithLogo> {
    createBrandDto.slug = normalizeSlug(createBrandDto.slug);

    if (await this.doesSlugExist(createBrandDto.slug)) {
      throw new BadRequestException('Brand with this slug already exists');
    }

    return this.dataSource.transaction(async (tx) => {
      const brand = toEntity(Brand, createBrandDto);
      const savedBrand = await tx.save(brand);

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

        return {
          ...savedBrand,
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

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<BrandWithLogo>> {
    const { page, limit } = extractPaginationParams(paginationQueryDto);

    const selectQueryBuilder = this.brandRepository
      .createQueryBuilder('b')
      .leftJoin(
        'media_assets',
        'm',
        `
          m.ref_type = :refType
          AND m.ref_id::uuid = b.id
          -- AND m.is_active = true // TODO: consider to add is_active in the media_assets table
        `,
        { refType: MediaAssetRefType.BRAND },
      )
      .select(['b', 'm.url AS logo'])
      .where('b.is_active = true')
      .orderBy('b.updated_at', 'DESC')
      .skip((page - 1) * limit)
      .limit(limit);

    const countQueryBuilder = selectQueryBuilder.clone();

    const [{ raw, entities }, totalCount] = await Promise.all([
      selectQueryBuilder.getRawAndEntities<BrandWithLogo>(),
      countQueryBuilder.getCount(),
    ]);

    const items = entities.map((brand, idx) => ({
      ...brand,
      logo: raw[idx].logo ?? null,
    }));

    return {
      items,
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string): Promise<BrandWithLogo> {
    const result = await this.brandRepository
      .createQueryBuilder('b')
      .leftJoin(
        'media_assets',
        'm',
        `
          m.ref_type = :refType
          AND m.ref_id::uuid = b.id
          -- AND m.is_active = true // TODO: consider to add is_active in the media_assets table
        `,
        { refType: MediaAssetRefType.BRAND },
      )
      .select(['b', 'm.url AS logo'])
      .where('b.id = :id AND b.is_active = true', { id })
      .getRawAndEntities<Brand & { logo: string | null }>();

    if (!result.entities.length) {
      throw new NotFoundException('Brand not found');
    }

    return {
      ...result.entities[0],
      logo: result.raw[0].logo,
    };
  }

  async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
    logo?: Express.Multer.File,
  ): Promise<BrandWithLogo> {
    const brand = await this.findOne(id);

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
        toEntity(Brand, { ...brand, ...updateBrandDto }),
      );

      let uploadResult: StorageUploadResult | null = null;

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
              createdBy: updatedBrand.updatedBy!,
            },
            tx,
          );

          if (oldMedia) {
            await this.mediaAssetsService.deleteById(oldMedia.id, tx);
          }

          if (oldMedia?.publicId) {
            await this.storageProvider.delete(oldMedia.publicId);
          }

          return {
            ...updatedBrand,
            logo: newMedia.url,
          };
        }

        return {
          ...updatedBrand,
          logo: brand?.logo ?? null,
        };
      } catch (error) {
        if (uploadResult?.key) {
          await this.storageProvider.delete(uploadResult.key);
        }
        throw error;
      }
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
}
