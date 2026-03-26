import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { ProductCategory } from '../entities';

@Injectable()
export class AdminProductCategoriesService {
  private readonly logger = new Logger(AdminProductCategoriesService.name);

  async create({
    productId,
    categoryIds,
    tx,
  }: {
    productId: string;
    categoryIds: string[];
    tx: EntityManager;
  }) {
    if (!categoryIds.length) {
      this.logger.debug(
        `[create] No categories to insert productId=${productId}`,
      );
      return;
    }

    const uniqueCategoryIds = [...new Set(categoryIds)];

    this.logger.debug(
      `[create] Inserting ${uniqueCategoryIds.length} categories productId=${productId}`,
    );

    try {
      await tx.insert(
        ProductCategory,
        uniqueCategoryIds.map((categoryId) => ({ productId, categoryId })),
      );
      this.logger.log(
        `[create] Categories inserted successfully count=${uniqueCategoryIds.length}, productId=${productId}`,
      );
    } catch (error) {
      this.logger.error(
        `[create] Failed to insert categories productId=${productId}`,
        error,
      );
      throw error;
    }
  }

  async sync({
    productId,
    categoryIds,
    tx,
  }: {
    productId: string;
    categoryIds: string[];
    tx: EntityManager;
  }) {
    if (!categoryIds.length) {
      this.logger.debug(`[sync] No categories provided productId=${productId}`);
      return;
    }

    const existing = await tx.find(ProductCategory, {
      where: { productId },
      select: ['categoryId'],
    });

    const currentIds = new Set(existing.map((e) => e.categoryId));
    const incomingIds = new Set(categoryIds);

    const toDelete = [...currentIds].filter((id) => !incomingIds.has(id));
    const toInsert = [...incomingIds].filter((id) => !currentIds.has(id));

    if (!toDelete.length && !toInsert.length) {
      this.logger.debug(`[sync] No changes productId=${productId}`);
      return;
    }

    this.logger.debug(
      `[sync] Applying diff productId=${productId}, insert=${toInsert.length}, delete=${toDelete.length}`,
    );

    try {
      if (toDelete.length) {
        await tx.delete(ProductCategory, {
          productId,
          categoryId: In(toDelete),
        });

        this.logger.log(
          `[sync] Categories deleted count=${toDelete.length}, productId=${productId}`,
        );
      }

      if (toInsert.length) {
        await tx.insert(
          ProductCategory,
          toInsert.map((categoryId) => ({ productId, categoryId })),
        );

        this.logger.log(
          `[sync] Categories inserted count=${toInsert.length}, productId=${productId}`,
        );
      }

      this.logger.log(`[sync] Category sync completed productId=${productId}`);
    } catch (error) {
      this.logger.error(
        `[sync] Failed to sync categories productId=${productId}`,
        error,
      );

      throw error;
    }
  }
}
