import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Brand } from '@/brands/entities';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';
import { Category } from '@/categories/entities/category.entity';
import { Product } from '@/products/entities';
import { GetMediasDto, UploadMediasDto } from './dto';
import { STORAGE_PROVIDER } from '@/storage/storage.module';
import type {
  StorageProvider,
  StorageUploadResult,
} from '@/storage/storage.provider';
import {
  BRAND_FOLDER,
  CATEGORY_FOLDER,
  PRODUCT_FOLDER,
} from '@/common/constants';
import { getErrorStack } from '@/common/utils';
import { MediaAssetsService } from './media-assets.service';
import { MediaAsset } from './entities';
import { mapToMediaAssetResponse } from './mappers';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  private readonly repositoryMap: Record<
    MediaAssetRefType,
    Repository<Brand | Category | Product>
  >;

  private readonly folderMap: Record<MediaAssetRefType, string> = {
    [MediaAssetRefType.BRAND]: BRAND_FOLDER,
    [MediaAssetRefType.CATEGORY]: CATEGORY_FOLDER,
    [MediaAssetRefType.PRODUCT]: PRODUCT_FOLDER,
  };

  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
    private readonly dataSource: DataSource,
    private readonly mediaAssetsService: MediaAssetsService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider,
  ) {
    this.repositoryMap = {
      [MediaAssetRefType.BRAND]: this.brandRepository,
      [MediaAssetRefType.CATEGORY]: this.categoryRepository,
      [MediaAssetRefType.PRODUCT]: this.productRepository,
    };
  }

  async upload(uploadMediasDto: UploadMediasDto, files: Express.Multer.File[]) {
    this.logger.log(
      `Upload medias start: refType=${uploadMediasDto.refType}, refId=${uploadMediasDto.refId}, isTemporary=${uploadMediasDto.isTemporary}, files=${files?.length}`,
    );

    if (!files?.length) {
      this.logger.warn('Upload media called without files');
      throw new BadRequestException('Files are required');
    }

    if (!uploadMediasDto.isTemporary) {
      await this.validateEntityByRefId(
        uploadMediasDto.refType,
        uploadMediasDto.refId,
      );
    }

    const uploadedResults: StorageUploadResult[] = [];
    try {
      this.logger.debug(`Uploading ${files.length} files to storage`);

      const uploads = await Promise.all(
        files.map((file) =>
          this.storageProvider.upload(file, {
            folder: `${this.getFolder(uploadMediasDto.refType)}/${uploadMediasDto.refId}`,
          }),
        ),
      );

      uploadedResults.push(...uploads);

      this.logger.debug('Files uploaded to storage successfully');

      const result = await this.dataSource.transaction(async (tx) => {
        this.logger.debug('Creating media records in DB');

        return await this.mediaAssetsService.create(
          uploads.map((upload) => ({
            publicId: upload.key,
            url: upload.url,
            resourceType: upload.resourceType,
            refType: uploadMediasDto.refType,
            refId: uploadMediasDto.refId,
            usageType: uploadMediasDto.usageType,
            createdBy: uploadMediasDto.createdBy,
          })),
          tx,
        );
      });

      this.logger.log(
        `Upload medias success: refType=${uploadMediasDto.refType}, refId=${uploadMediasDto.refId}, count=${result.length}`,
      );

      return result.map(mapToMediaAssetResponse);
    } catch (error) {
      this.logger.error(
        `Upload media failed: refType=${uploadMediasDto.refType}, refId=${uploadMediasDto.refId}`,
        getErrorStack(error),
      );

      if (uploadedResults.length) {
        this.logger.warn(
          `Rolling back ${uploadedResults.length} uploaded files`,
        );

        await Promise.all(
          uploadedResults.map((file) => this.storageProvider.delete(file.key)),
        );
      }

      throw error;
    }
  }

  async findAll(getMediasDto: GetMediasDto) {
    this.logger.debug(
      `Get medias: refType=${getMediasDto.refType}, refId=${getMediasDto.refId}, isTemporary=${getMediasDto.isTemporary}`,
    );

    if (!getMediasDto.isTemporary) {
      await this.validateEntityByRefId(
        getMediasDto.refType,
        getMediasDto.refId,
      );
    }

    const result = await this.mediaAssetRepository.find({
      where: {
        refType: getMediasDto.refType,
        refId: getMediasDto.refId,
        usageType: MediaAssetUsageType.DESCRIPTION,
        isActive: true,
      },
      select: ['id', 'url', 'refType', 'refId', 'usageType', 'metadata'],
      order: {
        updatedAt: { direction: 'DESC', nulls: 'LAST' },
        createdAt: 'DESC',
      },
    });

    this.logger.debug(`Found ${result.length} medias`);

    return result.map(mapToMediaAssetResponse);
  }

  async delete(id: string, actor: string) {
    this.logger.log(`Delete media start: id=${id}`);

    const media = await this.mediaAssetRepository.findOne({
      where: { id, isActive: true },
    });

    if (!media) {
      this.logger.warn(`Delete media failed: media not found id=${id}`);
      throw new NotFoundException('Media not found');
    }

    try {
      media.isActive = false;
      media.updatedBy = actor;
      await this.mediaAssetRepository.save(media);

      this.logger.debug(`Deleting media file from storage: ${media.publicId}`);

      await this.storageProvider.delete(media.publicId);

      this.logger.log(`Delete media success: id=${id}`);
    } catch (error) {
      this.logger.error(`Remove media failed: id=${id}`, getErrorStack(error));

      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOrphanTemporaryMedia() {
    this.logger.log('Starting cleanup of orphan temporary media...');

    while (true) {
      const medias = await this.mediaAssetRepository
        .createQueryBuilder('m')
        .where('m.is_active = true')
        .andWhere(
          `
            (
              (m.ref_type = :brandType AND NOT EXISTS (
                SELECT 1 FROM brands b WHERE b.id = m.ref_id::uuid AND b.is_active = true
              ))
              OR
              (m.ref_type = :categoryType AND NOT EXISTS (
                SELECT 1 FROM categories c WHERE c.id = m.ref_id::uuid AND c.is_active = true
              ))
              OR
              (m.ref_type = :productType AND NOT EXISTS (
                SELECT 1 FROM product_images pi WHERE pi.id = m.ref_id::uuid AND pi.is_active = true
              ))
            )
          `,
          {
            brandType: MediaAssetRefType.BRAND,
            categoryType: MediaAssetRefType.CATEGORY,
            productType: MediaAssetRefType.PRODUCT,
          },
        )
        .take(100)
        .getMany();

      if (!medias.length) {
        this.logger.log('No orphan media found.');
        break;
      }

      let deletedCount = 0;
      for (const media of medias) {
        try {
          await this.storageProvider.delete(media.publicId);

          this.logger.log(`Deleted orphan media file: ${media.publicId}`);

          await this.mediaAssetRepository.remove(media);
          deletedCount++;
        } catch (err) {
          this.logger.error(
            `Failed to delete orphan media ${media.id}: ${err}`,
          );
        }
      }

      if (deletedCount === 0) {
        this.logger.error(
          'Cleanup aborted: no progress in current batch, potential persistent failures',
        );
        break;
      }
    }

    this.logger.log('Orphan media cleanup finished.');
  }

  private getRepository(
    type: MediaAssetRefType,
  ): Repository<Brand | Category | Product> {
    const repository = this.repositoryMap[type];

    if (!repository) {
      throw new BadRequestException('Invalid media reference type');
    }

    return repository;
  }

  private async validateEntityByRefId(
    refType: MediaAssetRefType,
    refId: string,
  ) {
    const repository = this.getRepository(refType);

    const isExist = await repository.exists({
      where: {
        id: refId,
        isActive: true,
      },
    });

    if (!isExist) {
      this.logger.warn(`Upload failed: ${refType} not found (id=${refId})`);
      throw new BadRequestException(`${refType} not found`);
    }
  }

  private getFolder(type: MediaAssetRefType) {
    const folder = this.folderMap[type];

    if (!folder) {
      throw new BadRequestException('Invalid media reference type');
    }

    return folder;
  }
}
