import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EntityManager, In, InsertResult, UpdateResult } from 'typeorm';
import { SyncVariantAttributeDto } from './dto/requests/sync-variant-attribute.dto';
import { VariantAttribute } from './entities/variant-attribute.entity';
import { ProductAttribute } from '@/products/entities';

@Injectable()
export class VariantAttributesService {
  private logger = new Logger(VariantAttributesService.name);

  constructor() {}

  async sync({
    productId,
    variantId,
    attributes = [],
    actor,
    tx,
  }: {
    productId: string;
    variantId: string;
    attributes?: SyncVariantAttributeDto[];
    actor: string;
    tx: EntityManager;
  }) {
    if (!attributes?.length) return;

    this.logger.debug(
      `Sync attributes for variant=${variantId}, incoming=${attributes.length}`,
    );

    const productAttributeIds = attributes.map((a) => a.productAttributeId);

    await this.validate(tx, productId, productAttributeIds);

    const existing = await tx.find(VariantAttribute, {
      where: { variantId, isActive: true },
    });

    const existingMap = new Map(existing.map((e) => [e.id, e]));

    const upsertQueries: Promise<InsertResult | UpdateResult>[] = [];

    for (const attr of attributes) {
      if (attr.id && existingMap.has(attr.id)) {
        upsertQueries.push(
          tx.update(VariantAttribute, attr.id, {
            attributeValue: attr.attributeValue,
            attributeValueDisplay: attr.attributeValueDisplay,
            updatedBy: actor,
          }),
        );
      } else {
        upsertQueries.push(
          tx.insert(VariantAttribute, {
            variantId: variantId,
            productAttributeId: attr.productAttributeId,
            attributeValue: attr.attributeValue,
            attributeValueDisplay: attr.attributeValueDisplay,
            createdBy: actor,
          }),
        );
      }
    }

    await Promise.all(upsertQueries);
  }

  private async validate(
    tx: EntityManager,
    productId: string,
    productAttributeIds: string[],
  ) {
    const uniqueProductAttributeIds = new Set(productAttributeIds);

    const productAttributes = await tx.getRepository(ProductAttribute).find({
      where: {
        id: In([...uniqueProductAttributeIds]),
        productId,
        isActive: true,
      },
      select: ['id'],
    });

    if (productAttributes.length !== uniqueProductAttributeIds.size) {
      throw new BadRequestException(
        'Some attributes do not belong to this product',
      );
    }
  }
}
