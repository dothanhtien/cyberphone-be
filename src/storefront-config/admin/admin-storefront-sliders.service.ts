import { DataSource, EntityManager } from 'typeorm';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SliderCreateEntityInput,
  SliderResponseDto,
  SliderUpdateEntityInput,
  SyncSliderItemDto,
} from './dto';
import { SliderMapper } from '../mappers';
import {
  type IStorefrontSliderRepository,
  STOREFRONT_SLIDER_REPOSITORY,
} from '../repositories';
import { SLIDER_FOLDER } from '@/common/constants';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';
import {
  getErrorStack,
  getFilename,
  sanitizeEntityInput,
} from '@/common/utils';
import { MediaAssetsService } from '@/media/media-assets.service';
import { STORAGE_PROVIDER } from '@/storage/storage.module';
import type {
  StorageProvider,
  StorageUploadResult,
} from '@/storage/storage.provider';

type SliderItem = SyncSliderItemDto & { hasFile: boolean };

@Injectable()
export class AdminStorefrontSlidersService {
  private readonly logger = new Logger(AdminStorefrontSlidersService.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject(STOREFRONT_SLIDER_REPOSITORY)
    private readonly sliderRepository: IStorefrontSliderRepository,
    private readonly mediaAssetsService: MediaAssetsService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider,
  ) {}

  async syncSliders(
    items: SyncSliderItemDto[],
    images: Express.Multer.File[],
    actor: string,
  ): Promise<boolean> {
    this.logger.log(`[syncSliders] Syncing ${items.length} slider(s)`);

    const ids = items.map((i) => i.id);
    const existing = await this.sliderRepository.findByIds(ids);
    const existingIds = new Set(existing.map((s) => s.id));
    const fileMap = new Map(
      images.map((f) => [getFilename(f.originalname), f]),
    );

    const { toInsert, toUpdate, toDeactivate, toDelete } =
      this.classifySliderItems(items, fileMap, existingIds);

    this.logger.log(
      `[syncSliders] insert=${toInsert.length}, update=${toUpdate.length}, deactivate=${toDeactivate.length}, delete=${toDelete.length}`,
    );

    const itemsNeedingUpload = [
      ...toInsert.filter((i) => i.hasFile),
      ...toUpdate.filter((i) => i.hasFile),
    ];

    const uploadResults = await this.uploadSliderFiles(
      itemsNeedingUpload,
      fileMap,
    );

    try {
      await this.dataSource.transaction(async (tx) => {
        await this.syncSliderEntities(
          tx,
          { toInsert, toUpdate, toDeactivate, toDelete },
          actor,
        );
        await this.syncSliderMedia(
          tx,
          { toInsert, toUpdate, toDelete },
          uploadResults,
          actor,
        );
      });
    } catch (error) {
      this.logger.error(
        `[syncSliders] Transaction failed`,
        getErrorStack(error),
      );
      await Promise.all(
        [...uploadResults.values()].map((r) =>
          this.storageProvider.delete(r.key).catch(() => undefined),
        ),
      );
      throw error;
    }

    return true;
  }

  async findAllSliders(): Promise<SliderResponseDto[]> {
    const result = await this.sliderRepository.findAll();
    return result.map((r) => SliderMapper.mapToResponse(r));
  }

  private classifySliderItems(
    items: SyncSliderItemDto[],
    fileMap: Map<string, Express.Multer.File>,
    existingIds: Set<string>,
  ): {
    toInsert: SliderItem[];
    toUpdate: SliderItem[];
    toDeactivate: string[];
    toDelete: string[];
  } {
    const toInsert: SliderItem[] = [];
    const toUpdate: SliderItem[] = [];
    const toDeactivate: string[] = [];
    const toDelete: string[] = [];

    for (const item of items) {
      const hasFile = fileMap.has(item.id);
      if (!existingIds.has(item.id)) {
        toInsert.push({ ...item, hasFile });
      } else if (item.isDeleted) {
        toDelete.push(item.id);
      } else if (item.isDeactivated) {
        toDeactivate.push(item.id);
      } else {
        toUpdate.push({ ...item, hasFile });
      }
    }

    return { toInsert, toUpdate, toDeactivate, toDelete };
  }

  private async uploadSliderFiles(
    itemsNeedingUpload: SliderItem[],
    fileMap: Map<string, Express.Multer.File>,
  ): Promise<Map<string, StorageUploadResult>> {
    type UploadEntry = { id: string; result: StorageUploadResult };

    const settled = await Promise.allSettled(
      itemsNeedingUpload.map((item) =>
        this.storageProvider
          .upload(fileMap.get(item.id)!, {
            folder: SLIDER_FOLDER,
            filename: item.id,
          })
          .then((result) => ({ id: item.id, result })),
      ),
    );

    const failures = settled.filter((s) => s.status === 'rejected');
    if (failures.length > 0) {
      const firstError: unknown = failures[0].reason;
      this.logger.error(
        `[syncSliders] ${failures.length} upload(s) failed`,
        getErrorStack(firstError),
      );
      await Promise.all(
        (
          settled.filter(
            (s) => s.status === 'fulfilled',
          ) as PromiseFulfilledResult<UploadEntry>[]
        ).map((s) =>
          this.storageProvider
            .delete(s.value.result.key)
            .catch(() => undefined),
        ),
      );
      throw firstError;
    }

    return new Map(
      (settled as PromiseFulfilledResult<UploadEntry>[]).map((s) => [
        s.value.id,
        s.value.result,
      ]),
    );
  }

  private async syncSliderEntities(
    tx: EntityManager,
    classified: {
      toInsert: SliderItem[];
      toUpdate: SliderItem[];
      toDeactivate: string[];
      toDelete: string[];
    },
    actor: string,
  ): Promise<void> {
    const { toInsert, toUpdate, toDeactivate, toDelete } = classified;
    await Promise.all([
      this.sliderRepository.bulkInsert(
        tx,
        toInsert.map((item) =>
          sanitizeEntityInput(SliderCreateEntityInput, {
            id: item.id,
            title: item.title,
            altText: item.altText,
            displayOrder: item.displayOrder,
            createdBy: actor,
          }),
        ),
      ),
      this.sliderRepository.bulkUpdate(
        tx,
        toUpdate.map((item) => ({
          id: item.id,
          data: sanitizeEntityInput(SliderUpdateEntityInput, {
            title: item.title,
            altText: item.altText,
            displayOrder: item.displayOrder,
            isActive: item.isDeactivated === false ? true : undefined,
            updatedBy: actor,
          }),
        })),
      ),
      this.sliderRepository.bulkDeactivate(tx, toDeactivate, actor),
      this.sliderRepository.bulkHardDelete(tx, toDelete),
    ]);
  }

  private async syncSliderMedia(
    tx: EntityManager,
    classified: {
      toInsert: SliderItem[];
      toUpdate: SliderItem[];
      toDelete: string[];
    },
    uploadResults: Map<string, StorageUploadResult>,
    actor: string,
  ): Promise<void> {
    const { toInsert, toUpdate, toDelete } = classified;

    const makeMediaInput = (id: string, upload: StorageUploadResult) => ({
      publicId: upload.key,
      url: upload.url,
      resourceType: upload.resourceType,
      refType: MediaAssetRefType.SLIDER,
      refId: id,
      usageType: MediaAssetUsageType.MAIN,
      createdBy: actor,
    });

    const deleteMediaAsset = (
      image: { id: string; publicId?: string | null },
      tag: string,
    ) =>
      this.mediaAssetsService
        .deleteById(image.id, tx)
        .then(() =>
          image.publicId
            ? this.storageProvider
                .delete(image.publicId)
                .catch((err) => this.logger.error(tag, getErrorStack(err)))
            : undefined,
        );

    const insertMediaOps = toInsert
      .filter((item) => uploadResults.has(item.id))
      .map((item) =>
        this.mediaAssetsService.create(
          [makeMediaInput(item.id, uploadResults.get(item.id)!)],
          tx,
        ),
      );

    const [updateMediaOps, deleteMediaOps] = await Promise.all([
      Promise.all(
        toUpdate
          .filter((item) => item.hasFile)
          .map((item) =>
            this.mediaAssetsService
              .findByRefId({
                refType: MediaAssetRefType.SLIDER,
                refId: item.id,
                usageType: MediaAssetUsageType.MAIN,
                tx,
              })
              .then((oldImage) => {
                const ops: Promise<unknown>[] = [];
                const upload = uploadResults.get(item.id);
                if (oldImage) {
                  const sameKey = upload && oldImage.publicId === upload.key;
                  ops.push(
                    sameKey
                      ? this.mediaAssetsService.deleteById(oldImage.id, tx)
                      : deleteMediaAsset(
                          oldImage,
                          `[syncSliders] Failed to delete old image id=${item.id}`,
                        ),
                  );
                }
                if (upload) {
                  ops.push(
                    this.mediaAssetsService.create(
                      [makeMediaInput(item.id, upload)],
                      tx,
                    ),
                  );
                }
                return ops;
              }),
          ),
      ),
      Promise.all(
        toDelete.map((id) =>
          this.mediaAssetsService
            .findByRefId({
              refType: MediaAssetRefType.SLIDER,
              refId: id,
              usageType: MediaAssetUsageType.MAIN,
              tx,
            })
            .then((oldImage) =>
              oldImage
                ? [
                    deleteMediaAsset(
                      oldImage,
                      `[syncSliders] Failed to delete image for deleted slider id=${id}`,
                    ),
                  ]
                : [],
            ),
        ),
      ),
    ]);

    await Promise.all([
      ...insertMediaOps,
      ...updateMediaOps.flat(),
      ...deleteMediaOps.flat(),
    ]);
  }
}
