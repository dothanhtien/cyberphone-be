import { Inject, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  CreateProductAttributeDto,
  ProductAttributeCreateEntityDto,
} from './dto';
import { ProductAttribute } from '../entities';
import {
  type IProductAttributeRepository,
  PRODUCT_ATTRIBUTE_REPOSITORY,
} from './repositories';
import { getErrorStack, sanitizeEntityInput } from '@/common/utils';

@Injectable()
export class AdminProductAttributesService {
  private readonly logger = new Logger(AdminProductAttributesService.name);

  constructor(
    @Inject(PRODUCT_ATTRIBUTE_REPOSITORY)
    private readonly productAttributeRepository: IProductAttributeRepository,
  ) {}

  async findActiveByProductId(productId: string) {
    this.logger.debug(
      `[findActiveByProductId] Finding attributes productId=${productId}`,
    );

    return this.productAttributeRepository.findActiveByProductId(productId);
  }

  async create({
    productId,
    attributes,
    actor,
    tx,
  }: {
    productId: string;
    attributes: CreateProductAttributeDto[];
    actor: string;
    tx: EntityManager;
  }) {
    if (!attributes.length) {
      this.logger.warn(
        `[create] No attributes provided productId=${productId}`,
      );
      return;
    }

    this.logger.debug(
      `[create] Creating attributes productId=${productId}, count=${attributes.length}, actor=${actor}`,
    );

    try {
      const entities = attributes.map((attr) =>
        sanitizeEntityInput(ProductAttributeCreateEntityDto, {
          ...attr,
          productId: productId,
          createdBy: actor,
        }),
      );

      await this.productAttributeRepository.create(entities, tx);

      this.logger.debug(
        `[create] Attributes created successfully productId=${productId} count=${entities.length}`,
      );
    } catch (error) {
      this.logger.error(
        `[create] Failed to create attributes productId=${productId}`,
        getErrorStack(error),
      );

      throw error;
    }
  }

  async sync({
    productId,
    attributes,
    actor,
    tx,
  }: {
    productId: string;
    attributes: CreateProductAttributeDto[];
    actor: string;
    tx: EntityManager;
  }) {
    if (!attributes.length) {
      this.logger.warn(`[sync] No attributes provided productId=${productId}`);
      return;
    }

    this.logger.debug(
      `[sync] Syncing attributes productId=${productId}, incoming=${attributes.length}, actor=${actor}`,
    );

    try {
      const existing =
        await this.productAttributeRepository.findActiveByProductId(productId);

      const existingMap = new Map(existing.map((e) => [e.id, e]));
      const incomingIds = new Set(
        attributes.filter((a) => a.id).map((a) => a.id!),
      );
      const toRemove = existing.filter((e) => !incomingIds.has(e.id));

      if (toRemove.length) {
        this.logger.debug(
          `[sync] Removing attributes productId=${productId} count=${toRemove.length}`,
        );

        await this.remove(toRemove, actor, tx);
      }

      const toUpdate = attributes.filter((a) => a.id && existingMap.has(a.id));
      const toInsert = attributes.filter(
        (a) => !a.id || !existingMap.has(a.id),
      );

      this.logger.debug(
        `[sync] Split attributes productId=${productId} update=${toUpdate.length}, insert=${toInsert.length}`,
      );

      if (toUpdate.length) {
        await Promise.all(
          toUpdate.map((attr) =>
            this.productAttributeRepository.update(
              attr.id!,
              {
                attributeKey: attr.attributeKey,
                attributeKeyDisplay: attr.attributeKeyDisplay,
                displayOrder: attr.displayOrder,
                updatedBy: actor,
                isActive: true,
              },
              tx,
            ),
          ),
        );

        this.logger.debug(
          `[sync] Updated attributes productId=${productId}, count=${toUpdate.length}`,
        );
      }

      if (toInsert.length) {
        const insertEntities = toInsert.map((attr) => ({
          productId,
          attributeKey: attr.attributeKey,
          attributeKeyDisplay: attr.attributeKeyDisplay,
          displayOrder: attr.displayOrder,
          createdBy: actor,
          isActive: true,
        }));

        await this.productAttributeRepository.create(insertEntities, tx);

        this.logger.debug(
          `[sync] Inserted attributes productId=${productId}, count=${toInsert.length}`,
        );
      }

      this.logger.debug(
        `[sync] Attributes synced successfully productId=${productId}`,
      );
    } catch (error) {
      this.logger.error(
        `[sync] Failed to sync attributes productId=${productId}`,
        getErrorStack(error),
      );

      throw error;
    }
  }

  private async remove(
    toRemove: ProductAttribute[],
    actor: string,
    tx: EntityManager,
  ) {
    if (!toRemove.length) {
      this.logger.warn(`[remove] No attributes provided`);

      return;
    }

    this.logger.debug(
      `[remove] Removing attributes count=${toRemove.length}, actor=${actor}`,
    );

    const ids = toRemove.map((i) => i.id);

    try {
      const usedAttributes =
        await this.productAttributeRepository.findUsedAttributes(ids, tx);
      const usedIds = new Set(usedAttributes.map((a) => a.id));

      const toSoftDelete = ids.filter((id) => usedIds.has(id));
      const toHardDelete = ids.filter((id) => !usedIds.has(id));

      if (toSoftDelete.length) {
        this.logger.debug(
          `[remove] Soft deleting attributes count=${toSoftDelete.length}`,
        );

        await this.productAttributeRepository.bulkUpdate(
          toSoftDelete,
          {
            isActive: false,
            updatedBy: actor,
          },
          tx,
        );
      }

      if (toHardDelete.length) {
        this.logger.debug(
          `[remove] Hard deleting attributes count=${toHardDelete.length}`,
        );

        await this.productAttributeRepository.delete(toHardDelete, tx);
      }
    } catch (error) {
      this.logger.error(
        `[remove] Failed to remove attributes`,
        getErrorStack(error),
      );

      throw error;
    }
  }
}
