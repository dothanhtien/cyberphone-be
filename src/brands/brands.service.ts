import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  BrandCreateEntityInput,
  BrandResponseDto,
  BrandUpdateEntityInput,
  CreateBrandDto,
  UpdateBrandDto,
} from './dto';
import { BrandMapper } from './mappers';
import { type IBrandRepository, BRAND_REPOSITORY } from './repositories';
import { MediaAssetsService } from '@/media/media-assets.service';
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
  normalizeSlug,
  sanitizeEntityInput,
} from '@/common/utils';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
    private readonly dataSource: DataSource,
    private readonly mediaAssetsService: MediaAssetsService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider,
  ) {}

  async create(createBrandDto: CreateBrandDto, logo?: Express.Multer.File) {
    this.logger.log(
      `[create] Creating brand name=${createBrandDto.name}, slug=${createBrandDto.slug}`,
    );

    createBrandDto.slug = normalizeSlug(createBrandDto.slug);

    if (await this.brandRepository.existsActiveBySlug(createBrandDto.slug)) {
      this.logger.warn(
        `[create] Brand slug already exists name=${createBrandDto.name}, slug=${createBrandDto.slug}`,
      );
      throw new BadRequestException('Brand with this slug already exists');
    }

    return this.dataSource.transaction(async (tx) => {
      const brandEntity = sanitizeEntityInput(
        BrandCreateEntityInput,
        createBrandDto,
      );

      const savedBrand = await this.brandRepository.create(brandEntity, tx);

      this.logger.debug(`[create] Brand saved with id=${savedBrand.id}`);

      let uploadResult: StorageUploadResult | null = null;

      try {
        if (logo) {
          this.logger.debug(
            `[create] Uploading logo for brand ${savedBrand.id}`,
          );

          uploadResult = await this.storageProvider.upload(logo, {
            folder: BRAND_FOLDER,
          });

          await this.mediaAssetsService.create(
            [
              {
                publicId: uploadResult.key,
                url: uploadResult.url,
                resourceType: uploadResult.resourceType,
                refType: MediaAssetRefType.BRAND,
                refId: savedBrand.id,
                usageType: MediaAssetUsageType.LOGO,
                createdBy: savedBrand.createdBy,
              },
            ],
            tx,
          );

          this.logger.debug(
            `[create] Logo uploaded for brand ${savedBrand.id} - key=${uploadResult.key}`,
          );
        }

        return { id: savedBrand.id };
      } catch (error) {
        this.logger.error(
          `[create] Failed to create brand name=${createBrandDto.name}, slug=${createBrandDto.slug}`,
          getErrorStack(error),
        );

        if (uploadResult?.key) {
          await this.storageProvider.delete(uploadResult.key);
          this.logger.warn(
            `[create] Rolled back uploaded file ${uploadResult.key}`,
          );
        }

        throw error;
      }
    });
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<BrandResponseDto>> {
    const { page, limit } = extractPaginationParams(paginationQueryDto);

    this.logger.debug(`[findAll] Fetching brands page=${page} limit=${limit}`);

    const offset = (page - 1) * limit;

    const [rows, totalCount] = await Promise.all([
      this.brandRepository.findAllWithLogo(limit, offset),
      this.brandRepository.countAllActive(),
    ]);

    this.logger.debug(`[findAll] Fetched ${rows.length} brands`);

    return {
      items: rows.map((i) => BrandMapper.mapToBrandResponse(i)),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string): Promise<BrandResponseDto> {
    this.logger.debug(`[findOne] Fetching brand id=${id}`);

    const brand = await this.brandRepository.findOneWithLogo(id);

    if (!brand) {
      this.logger.warn(`[findOne] Brand not found id=${id}`);
      throw new NotFoundException('Brand not found');
    }

    return BrandMapper.mapToBrandResponse(brand);
  }

  async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
    logo?: Express.Multer.File,
  ): Promise<boolean> {
    this.logger.log(`[update] Updating brand id=${id}`);

    const brand = await this.brandRepository.findActiveByIdWithProductCount(id);

    if (!brand) {
      this.logger.warn(`[update] Brand not found id=${id}`);
      throw new NotFoundException('Brand not found');
    }

    if (updateBrandDto.slug) {
      updateBrandDto.slug = normalizeSlug(updateBrandDto.slug);
    }

    if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      if (
        await this.brandRepository.existsActiveBySlug(updateBrandDto.slug, id)
      ) {
        this.logger.warn(
          `[update] Slug already exists: ${updateBrandDto.slug}`,
        );
        throw new BadRequestException('Slug already exists');
      }
    }

    await this.dataSource.transaction(async (tx) => {
      const entityInput = sanitizeEntityInput(BrandUpdateEntityInput, {
        ...brand,
        ...updateBrandDto,
      });

      if (updateBrandDto.isActive === false) {
        if (brand.productCount > 0) {
          this.logger.warn(
            `[update] Cannot delete brand id=${id} because it has products`,
          );
          throw new BadRequestException(
            'Cannot delete brand with existing products',
          );
        }

        entityInput.isActive = false;
        this.logger.debug(`[update] Setting brand id=${id} as inactive`);
      }

      this.logger.debug(
        `[update] Update payload for brand ${id}: ${JSON.stringify(entityInput)}`,
      );

      const updatedBrand = await this.brandRepository.update(
        id,
        entityInput,
        tx,
      );

      this.logger.debug(`[update] Brand updated id=${updatedBrand.id}`);

      let uploadResult: StorageUploadResult | null = null;

      try {
        const oldLogo = await this.mediaAssetsService.findByRefId({
          refType: MediaAssetRefType.BRAND,
          refId: id,
          usageType: MediaAssetUsageType.LOGO,
          tx,
        });

        const shouldRemoveOld = updateBrandDto.removeLogo || !!logo;

        if (logo) {
          this.logger.debug(`[update] Uploading new logo for brand ${id}`);

          uploadResult = await this.storageProvider.upload(logo, {
            folder: BRAND_FOLDER,
          });

          await this.mediaAssetsService.create(
            [
              {
                publicId: uploadResult.key,
                url: uploadResult.url,
                resourceType: uploadResult.resourceType,
                refType: MediaAssetRefType.BRAND,
                refId: id,
                usageType: MediaAssetUsageType.LOGO,
                createdBy: updateBrandDto.updatedBy,
              },
            ],
            tx,
          );
        }

        if (shouldRemoveOld && oldLogo) {
          try {
            await this.mediaAssetsService.deleteById(oldLogo.id, tx);
            if (oldLogo.publicId) {
              await this.storageProvider.delete(oldLogo.publicId);
              this.logger.debug(
                `[update] Deleted old logo ${oldLogo.publicId}`,
              );
            }
          } catch (err) {
            this.logger.error(
              `[update] Failed to delete old logo ${oldLogo.publicId}: ${getErrorStack(err)}`,
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `[update] Failed updating brand ${id}`,
          getErrorStack(error),
        );

        if (uploadResult?.key) {
          await this.storageProvider.delete(uploadResult.key);
          this.logger.warn(
            `[update] Rolled back uploaded file ${uploadResult.key}`,
          );
        }

        throw error;
      }
    });

    return true;
  }

  async exists(id: string): Promise<boolean> {
    return this.brandRepository.existsActiveById(id);
  }
}
