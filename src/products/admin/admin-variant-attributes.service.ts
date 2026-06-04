import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import {
  SyncVariantAttributeDto,
  VariantAttributeCreateEntityDto,
  VariantAttributeUpdateEntityDto,
} from './dto';
import {
  type IVariantAttributeRepository,
  VARIANT_ATTRIBUTE_REPOSITORY,
} from '../repositories';
import { sanitizeEntityInput } from '@/common/utils';
import { ProductAttribute } from '@/products/entities';

@Injectable()
export class AdminVariantAttributesService {
  private readonly logger = new Logger(AdminVariantAttributesService.name);

  constructor(
    @Inject(VARIANT_ATTRIBUTE_REPOSITORY)
    private readonly variantAttributeRepository: IVariantAttributeRepository,
  ) {}

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
    this.logger.debug(
      `[sync] Syncing attributes productId=${productId}, variantId=${variantId}, incoming=${attributes?.length ?? 0}`,
    );

    if (!attributes?.length) {
      this.logger.debug(
        `[sync] No attributes to process variantId=${variantId}`,
      );
      return;
    }

    const productAttributeIds = attributes.map((a) => a.productAttributeId);

    await this.validate(tx, productId, productAttributeIds);

    const existing =
      await this.variantAttributeRepository.findAllActiveByVariantId(
        variantId,
        tx,
      );

    this.logger.debug(
      `[sync] Existing attributes variantId=${variantId}, count=${existing.length}`,
    );

    const existingMap = new Map(existing.map((e) => [e.id, e]));

    const upsertQueries: Promise<void>[] = [];

    let updateCount = 0;
    let createCount = 0;

    for (const attr of attributes) {
      if (attr.id && existingMap.has(attr.id)) {
        updateCount++;

        this.logger.debug(
          `[sync] Updating attribute id=${attr.id}, variantId=${variantId}`,
        );

        upsertQueries.push(
          this.variantAttributeRepository.update(
            attr.id,
            sanitizeEntityInput(VariantAttributeUpdateEntityDto, {
              attributeValue: attr.attributeValue,
              attributeValueDisplay: attr.attributeValueDisplay,
              updatedBy: actor,
            }),
            tx,
          ),
        );
      } else {
        createCount++;

        this.logger.debug(
          `[sync] Creating attribute productAttributeId=${attr.productAttributeId}, variantId=${variantId}`,
        );

        upsertQueries.push(
          this.variantAttributeRepository.create(
            sanitizeEntityInput(VariantAttributeCreateEntityDto, {
              variantId: variantId,
              productAttributeId: attr.productAttributeId,
              attributeValue: attr.attributeValue,
              attributeValueDisplay: attr.attributeValueDisplay,
              createdBy: actor,
            }),
            tx,
          ),
        );
      }
    }

    await Promise.all(upsertQueries);

    this.logger.log(
      `[sync] Completed variantId=${variantId}, created=${createCount}, updated=${updateCount}`,
    );
  }

  private async validate(
    tx: EntityManager,
    productId: string,
    productAttributeIds: string[],
  ) {
    this.logger.debug(
      `[validate] productId=${productId}, attributeIds=${productAttributeIds.length}`,
    );

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
      this.logger.warn(
        `[validate] Invalid attributes detected productId=${productId}`,
      );

      throw new BadRequestException(
        'Some attributes do not belong to this product',
      );
    }

    this.logger.debug(
      `[validate] Validation passed productId=${productId}, validCount=${productAttributes.length}`,
    );
  }
}
