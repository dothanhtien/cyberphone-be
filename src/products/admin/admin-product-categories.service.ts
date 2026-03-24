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
        `[create] No categories to insert, skip — productId=${productId}`,
      );
      return;
    }

    const uniqueCategoryIds = [...new Set(categoryIds)];

    this.logger.debug(
      `[create] Inserting ${uniqueCategoryIds.length} categories — productId=${productId}`,
    );

    await tx.insert(
      ProductCategory,
      uniqueCategoryIds.map((categoryId) => ({ productId, categoryId })),
    );

    this.logger.debug(`[create] Done — productId=${productId}`);
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
      this.logger.debug(
        `[sync] Empty categoryIds, skip — productId=${productId}`,
      );
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
      this.logger.debug(`[sync] No changes detected — productId=${productId}`);
      return;
    }

    this.logger.debug(
      `[sync] Applying diff — productId=${productId}, insert=${toInsert.length}, delete=${toDelete.length}`,
    );

    if (toDelete.length) {
      await tx.delete(ProductCategory, { productId, categoryId: In(toDelete) });
      this.logger.debug(
        `[sync] Deleted ${toDelete.length} categories — productId=${productId}`,
      );
    }

    if (toInsert.length) {
      await tx.insert(
        ProductCategory,
        toInsert.map((categoryId) => ({ productId, categoryId })),
      );
      this.logger.debug(
        `[sync] Inserted ${toInsert.length} categories — productId=${productId}`,
      );
    }
  }
}
