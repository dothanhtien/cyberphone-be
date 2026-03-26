import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { ProductCreateEntityDto, ProductUpdateEntityDto } from '../dto';
import { ProductRaw } from '../types';
import { MediaAssetRefType, ProductImageType } from '@/common/enums';
import { getErrorStack, isUniqueConstraintError } from '@/common/utils';
import { Product } from '@/products/entities';

export interface IProductRepository {
  create(data: ProductCreateEntityDto, tx: EntityManager): Promise<Product>;
  findActiveById(id: string): Promise<Product | null>;
  existsActiveById(id: string): Promise<boolean>;
  existsActiveBySlugExcludingId(
    slug: string,
    excludeId?: string,
  ): Promise<boolean>;
  findAllRaw(limit: number, offset: number): Promise<ProductRaw[]>;
  countActive(): Promise<number>;
  findOneRaw(id: string): Promise<ProductRaw | null>;
  update(
    id: string,
    data: ProductUpdateEntityDto,
    tx: EntityManager,
  ): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');

@Injectable()
export class ProductRepository implements IProductRepository {
  private readonly logger = new Logger(ProductRepository.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    data: ProductCreateEntityDto,
    tx: EntityManager,
  ): Promise<Product> {
    try {
      const product = await tx.save(Product, data);

      this.logger.debug(`Product created id=${product.id}`);

      return product;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        this.logger.warn(`Unique constraint violation on slug`);
        throw new ConflictException('Slug already exists');
      }
      this.logger.error(
        `Failed to create product entity`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  findActiveById(id: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id, isActive: true } });
  }

  existsActiveById(id: string): Promise<boolean> {
    return this.productRepository.exists({ where: { id, isActive: true } });
  }

  async existsActiveBySlugExcludingId(
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    const existing = await this.productRepository.count({
      where: {
        slug,
        isActive: true,
        ...(excludeId ? { id: Not(excludeId) } : {}),
      },
    });

    return existing > 0;
  }

  countActive(): Promise<number> {
    return this.productRepository.count({ where: { isActive: true } });
  }

  async findAllRaw(limit: number, offset: number): Promise<ProductRaw[]> {
    return this.productRepository.query<ProductRaw[]>(
      `
        SELECT 
          p.id, p.name, p.slug, p.status,
          p.is_featured AS "isFeatured",
          p.is_bestseller AS "isBestseller",
          p.is_active AS "isActive",
          p.created_at AS "createdAt",
          p.created_by AS "createdBy",
          p.updated_at AS "updatedAt",
          p.updated_by AS "updatedBy",
          json_build_object('id', b.id, 'name', b.name) AS brand,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', c.id, 'name', c.name)
            ) FILTER (WHERE c.id IS NOT NULL), '[]'
          ) AS categories,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', pi.id, 'imageType', pi.image_type, 'altText', pi.alt_text, 'url', m.url)
            ) FILTER (WHERE pi.id IS NOT NULL), '[]'
          ) AS images,
          COUNT(DISTINCT pv.id) AS "variantCount"
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id AND b.is_active = true
        LEFT JOIN product_categories pc ON pc.product_id = p.id
        LEFT JOIN categories c ON c.id = pc.category_id AND c.is_active = true
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.image_type = $1 AND pi.is_active = true
        LEFT JOIN media_assets m ON m.ref_type = $2 AND m.ref_id::uuid = pi.id AND m.is_active = true
        LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = true
        WHERE p.is_active = true
        GROUP BY p.id, b.id
        ORDER BY COALESCE(p.updated_at, p.created_at) DESC
        LIMIT $3 OFFSET $4
      `,
      [ProductImageType.MAIN, MediaAssetRefType.PRODUCT, limit, offset],
    );
  }

  async findOneRaw(id: string): Promise<ProductRaw | null> {
    const rows = await this.productRepository.query<ProductRaw[]>(
      `
        SELECT 
          p.id, p.name, p.slug, p.status,
          p.short_description AS "shortDescription",
          p.long_description AS "longDescription",
          p.is_featured AS "isFeatured",
          p.is_bestseller AS "isBestseller",
          p.is_active AS "isActive",
          p.created_at AS "createdAt",
          p.created_by AS "createdBy",
          p.updated_at AS "updatedAt",
          p.updated_by AS "updatedBy",
          json_build_object('id', b.id, 'name', b.name) AS brand,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', c.id, 'name', c.name)
            ) FILTER (WHERE c.id IS NOT NULL), '[]'
          ) AS categories,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', pi.id, 'imageType', pi.image_type, 'altText', pi.alt_text, 'url', m.url)
            ) FILTER (WHERE pi.id IS NOT NULL), '[]'
          ) AS images,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pa.id, 
                'attributeKey', pa.attribute_key, 
                'attributeKeyDisplay', pa.attribute_key_display, 
                'displayOrder', pa.display_order
              )
            ) FILTER (WHERE pa.id IS NOT NULL), '[]'
          ) AS attributes
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id AND b.is_active = true
        LEFT JOIN product_categories pc ON pc.product_id = p.id
        LEFT JOIN categories c ON c.id = pc.category_id AND c.is_active = true
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_active = true
        LEFT JOIN media_assets m ON m.ref_type = $1 AND m.ref_id::uuid = pi.id AND m.is_active = true
        LEFT JOIN product_attributes pa ON pa.product_id = p.id AND pa.is_active = true
        WHERE p.id = $2 AND p.is_active = true
        GROUP BY p.id, b.id
      `,
      [MediaAssetRefType.PRODUCT, id],
    );

    return rows[0] ?? null;
  }

  async update(
    id: string,
    data: ProductUpdateEntityDto,
    tx: EntityManager,
  ): Promise<void> {
    await tx.update(Product, id, data);
  }
}
