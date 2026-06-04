import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  CreateProductImageDto,
  ProductImageCreateEntityDto,
  ProductImageUpdateEntityDto,
} from './dto';
import { ProductImage } from '../entities';
import { mapProductImageTypeToMediaUsage } from './mappers';
import {
  type IProductImageRepository,
  PRODUCT_IMAGE_REPOSITORY,
} from '../repositories';
import { MediaAssetRefType } from '@/common/enums';
import { sanitizeEntityInput } from '@/common/utils';
import { MediaAssetCreateEntityDto } from '@/media/dto';
import { StorageUploadResult } from '@/storage/storage.provider';

@Injectable()
export class AdminProductImagesService {
  private readonly logger = new Logger(AdminProductImagesService.name);

  constructor(
    @Inject(PRODUCT_IMAGE_REPOSITORY)
    private readonly productImageRepository: IProductImageRepository,
  ) {}

  async create({
    productId,
    imageMetas,
    actor,
    tx,
  }: {
    productId: string;
    imageMetas: CreateProductImageDto[];
    actor: string;
    tx: EntityManager;
  }) {
    if (!imageMetas.length) {
      this.logger.warn(
        `[create] No imageMetas provided productId=${productId}`,
      );
      return [];
    }

    this.logger.log(
      `[create] Creating ${imageMetas.length} product image(s) productId=${productId}`,
    );

    const entities = imageMetas.map((meta) =>
      sanitizeEntityInput(ProductImageCreateEntityDto, {
        ...meta,
        productId,
        createdBy: actor,
      }),
    );

    const result = await this.productImageRepository.create(tx, entities);

    this.logger.log(
      `[create] Successfully created ${result.length} image(s) productId=${productId}`,
    );

    return result;
  }

  async sync({
    imageMetas,
    productId,
    actor,
    tx,
  }: {
    imageMetas: CreateProductImageDto[];
    productId: string;
    actor: string;
    tx: EntityManager;
  }): Promise<ProductImage[]> {
    if (!imageMetas.length) {
      this.logger.warn(`[sync] No metaData provided productId=${productId}`);
      return [];
    }

    this.logger.log(
      `[sync] Syncing ${imageMetas.length} image(s) productId=${productId}`,
    );

    const existing =
      await this.productImageRepository.findActiveByProductId(productId);

    this.logger.log(
      `[sync] Found ${existing.length} existing image(s) productId=${productId}`,
    );

    const { toInsert, toUpdate, toDelete } = this.diff({
      imageMetas: imageMetas,
      productImages: existing,
      productId: productId,
      actor: actor,
    });

    this.logger.log(
      `[sync] Diff result productId=${productId}, insert=${toInsert.length}, update=${toUpdate.length}, delete=${toDelete.length}`,
    );

    const [inserted] = await Promise.all([
      this.productImageRepository.bulkInsert(tx, toInsert),
      this.productImageRepository.bulkUpdate(tx, toUpdate),
      this.productImageRepository.bulkDelete(tx, toDelete),
    ]);

    this.logger.log(
      `[sync] Successfully synced images productId=${productId}, inserted=${inserted.length}`,
    );

    return inserted;
  }

  private diff({
    imageMetas,
    productImages,
    productId,
    actor,
  }: {
    imageMetas: CreateProductImageDto[];
    productImages: ProductImage[];
    productId: string;
    actor: string;
  }): {
    toInsert: ProductImageCreateEntityDto[];
    toUpdate: { id: string; data: ProductImageUpdateEntityDto }[];
    toDelete: string[];
  } {
    const existingMap = new Map(productImages.map((e) => [e.id, e]));

    const toInsert: ProductImageCreateEntityDto[] = [];
    const toUpdate: { id: string; data: ProductImageUpdateEntityDto }[] = [];
    const toDelete: string[] = [];

    for (const item of imageMetas) {
      const existed = existingMap.get(item.id);

      if (!existed) {
        toInsert.push(
          sanitizeEntityInput(ProductImageCreateEntityDto, {
            id: item.id,
            productId: productId,
            variantId: null,
            imageType: item.imageType,
            altText: item.altText,
            title: item.title,
            displayOrder: item.displayOrder,
            isActive: true,
            createdBy: actor,
          }),
        );
      } else if (item.isDeleted) {
        toDelete.push(item.id);
      } else {
        toUpdate.push({
          id: item.id,
          data: sanitizeEntityInput(ProductImageUpdateEntityDto, {
            isActive: true,
            imageType: item.imageType,
            altText: item.altText,
            title: item.title,
            displayOrder: item.displayOrder,
            updatedBy: actor,
          }),
        });
      }
    }

    this.logger.debug(
      `[diff] Computed diff productId=${productId}, toInsert=${toInsert.length}, toUpdate=${toUpdate.length}, toDelete=${toDelete.length}`,
    );

    return { toInsert, toUpdate, toDelete };
  }

  buildMediaAssets({
    productImages,
    imageMetas,
    uploadResults,
  }: {
    productImages: ProductImage[];
    imageMetas: CreateProductImageDto[];
    uploadResults: StorageUploadResult[];
  }): MediaAssetCreateEntityDto[] {
    if (productImages.length !== uploadResults.length) {
      const msg = `Image count mismatch productImages=${productImages.length}, uploadResults=${uploadResults.length}`;
      this.logger.error(`[buildMediaAssets] ${msg}`);

      throw new ConflictException(msg);
    }

    const metaMap = new Map(imageMetas.map((m) => [m.id, m]));

    const assets = productImages.flatMap((pi) => {
      const meta = metaMap.get(pi.id);
      if (!meta) return [];

      const upload = uploadResults.find((u) => u.key.includes(pi.id));
      if (!upload) return [];

      return [
        {
          publicId: upload.key,
          url: upload.url,
          resourceType: upload.resourceType,
          refType: MediaAssetRefType.PRODUCT,
          refId: pi.id,
          usageType: mapProductImageTypeToMediaUsage(meta.imageType),
          createdBy: pi.createdBy,
        },
      ];
    });

    this.logger.log(`[buildMediaAssets] Built ${assets.length} media asset(s)`);

    return assets;
  }
}
