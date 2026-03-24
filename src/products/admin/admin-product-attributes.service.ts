import { Inject, Injectable, Logger } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import {
  CreateProductAttributeDto,
  ProductAttributeCreateEntityDto,
} from './dto';
import { ProductAttribute } from '../entities';
import {
  type IProductAttributeRepository,
  PRODUCT_ATTRIBUTE_REPOSITORY,
} from './repositories';
import { sanitizeEntityInput } from '@/common/utils';

@Injectable()
export class AdminProductAttributesService {
  private readonly logger = new Logger(AdminProductAttributesService.name);

  constructor(
    @Inject(PRODUCT_ATTRIBUTE_REPOSITORY)
    private readonly productAttributeRepository: IProductAttributeRepository,
  ) {}

  async findActiveByProductId(productId: string) {
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
    if (!attributes.length) return;

    this.logger.debug(
      `Creating ${attributes.length} attributes for product: ${productId}`,
    );

    const entities = attributes.map((attr) =>
      sanitizeEntityInput(ProductAttributeCreateEntityDto, {
        ...attr,
        productId: productId,
        createdBy: actor,
      }),
    );

    await tx.insert(ProductAttribute, entities);
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
    this.logger.debug(
      `Sync attributes for product=${productId}, incoming=${attributes.length}`,
    );

    const existing = await tx.find(ProductAttribute, { where: { productId } });

    const existingMap = new Map(existing.map((e) => [e.id, e]));
    const incomingIds = new Set(
      attributes.filter((a) => a.id).map((a) => a.id!),
    );
    const toRemove = existing.filter((e) => !incomingIds.has(e.id));

    if (toRemove.length) {
      await this.remove(toRemove, actor, tx);
    }

    await this.upsert(attributes, existingMap, productId, actor, tx);
  }

  private async remove(
    toRemove: ProductAttribute[],
    actor: string,
    tx: EntityManager,
  ) {
    this.logger.debug(`Removing attributes count=${toRemove.length}`);

    const ids = toRemove.map((i) => i.id);
    const usedIds = await this.findUsedAttributeIds(ids, tx);

    const toSoftDelete = ids.filter((id) => usedIds.has(id));
    const toHardDelete = ids.filter((id) => !usedIds.has(id));

    if (toSoftDelete.length) {
      this.logger.debug(
        `Soft deleting attributes count=${toSoftDelete.length}`,
      );
      await tx.update(
        ProductAttribute,
        { id: In(toSoftDelete) },
        { isActive: false, updatedBy: actor },
      );
    }

    if (toHardDelete.length) {
      this.logger.debug(
        `Hard deleting attributes count=${toHardDelete.length}`,
      );
      await tx.delete(ProductAttribute, { id: In(toHardDelete) });
    }
  }

  private async findUsedAttributeIds(
    ids: string[],
    tx: EntityManager,
  ): Promise<Set<string>> {
    const used = await tx
      .createQueryBuilder()
      .select('va.productAttributeId', 'id')
      .from('variant_attributes', 'va')
      .where('va.productAttributeId IN (:...ids)', { ids })
      .groupBy('va.productAttributeId')
      .getRawMany<{ id: string }>();

    return new Set(used.map((u) => u.id));
  }

  private async upsert(
    attributes: CreateProductAttributeDto[],
    existingMap: Map<string, ProductAttribute>,
    productId: string,
    actor: string,
    tx: EntityManager,
  ) {
    const toUpdate = attributes.filter((a) => a.id && existingMap.has(a.id));
    const toInsert = attributes.filter((a) => !a.id || !existingMap.has(a.id));

    this.logger.debug(
      `Upsert attributes — update: ${toUpdate.length}, insert: ${toInsert.length}`,
    );

    if (toUpdate.length) {
      await Promise.all(
        toUpdate.map((attr) =>
          tx.update(ProductAttribute, attr.id, {
            attributeKey: attr.attributeKey,
            attributeKeyDisplay: attr.attributeKeyDisplay,
            displayOrder: attr.displayOrder,
            updatedBy: actor,
            isActive: true,
          }),
        ),
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

      await tx.insert(ProductAttribute, insertEntities);
    }
  }
}
