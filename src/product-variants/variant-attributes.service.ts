import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { sanitizeEntityInput } from '@/common/utils/entities';
import { CreateProductVariantDto } from './dto/requests/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/requests/update-product-variant.dto';
import { VariantAttribute } from './entities/variant-attribute.entity';
import { ProductAttribute } from '@/products/entities/product-attribute.entity';
import { VariantAttributeCreateEntityDto } from './dto/entity-inputs/variant-attribute-create-entity.dto';

@Injectable()
export class VariantAttributesService {
  constructor() {}

  async createAttributes(
    tx: EntityManager,
    productId: string,
    variantId: string,
    attributes: CreateProductVariantDto['attributes'],
    createdBy: string,
  ): Promise<void> {
    if (!attributes?.length) return;

    await this.validateProductAttributes(
      tx,
      productId,
      attributes.map((a) => a.productAttributeId),
    );

    const attributeEntities = attributes.map((attr) =>
      sanitizeEntityInput(VariantAttributeCreateEntityDto, {
        variantId,
        productAttributeId: attr.productAttributeId,
        attributeValue: attr.attributeValue,
        attributeValueDisplay: attr.attributeValueDisplay ?? null,
        createdBy,
      }),
    );

    await tx.getRepository(VariantAttribute).save(attributeEntities);
  }

  async updateAttributes(
    tx: EntityManager,
    variantId: string,
    productId: string,
    attributes: UpdateProductVariantDto['attributes'],
    updatedBy: string,
  ) {
    if (!attributes?.length) return;

    const productAttributeIds = attributes.map((a) => a.productAttributeId);

    await this.validateProductAttributes(tx, productId, productAttributeIds);

    const ids = attributes.map((a) => a.id);

    const variantAttributeRepository = tx.getRepository(VariantAttribute);

    const existingAttrs = await variantAttributeRepository.find({
      where: {
        id: In(ids),
        productAttributeId: In(productAttributeIds),
        variantId,
        isActive: true,
      },
    });

    if (existingAttrs.length !== ids.length) {
      throw new NotFoundException('Some variant attributes were not found');
    }

    const existingMap = new Map(existingAttrs.map((a) => [a.id, a]));

    const toUpdate = attributes.map((attr) => {
      const existing = existingMap.get(attr.id)!;

      existing.attributeValue = attr.attributeValue ?? existing.attributeValue;
      existing.attributeValueDisplay =
        attr.attributeValueDisplay ?? existing.attributeValueDisplay;
      existing.updatedBy = updatedBy;

      return existing;
    });

    await variantAttributeRepository.save(toUpdate);
  }

  private async validateProductAttributes(
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
