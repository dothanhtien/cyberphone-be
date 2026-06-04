import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { ProductCreateEntityDto, ProductUpdateEntityDto } from '../admin/dto';
import { ProductRaw } from '../admin/types';
import { FilterProductsDto } from '../storefront/dto';
import { ProductSortEnum } from '../storefront/enums';
import { ProductDetailsRaw, RawProductRow } from '../storefront/types';
import { MediaAssetRefType, ProductImageType } from '@/common/enums';
import {
  extractPaginationParams,
  getErrorStack,
  isUniqueConstraintError,
} from '@/common/utils';
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

  findAllForStorefront(
    params: FilterProductsDto,
  ): Promise<{ items: RawProductRow[]; total: number }>;
  findOneForStorefront(slug: string): Promise<ProductDetailsRaw | null>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');

@Injectable()
export class ProductRepository implements IProductRepository {
  private readonly logger = new Logger(ProductRepository.name);

  constructor(
    private readonly dataSource: DataSource,
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

  async findAllForStorefront(
    params: FilterProductsDto,
  ): Promise<{ items: RawProductRow[]; total: number }> {
    const { page, limit } = extractPaginationParams(params);
    const offset = (page - 1) * limit;

    const values: unknown[] = [];

    let whereClause = `
      WHERE p.is_active = true
        AND p.status = 'active'
    `;

    if (params.search) {
      values.push(`%${params.search}%`);
      whereClause += ` AND p.name ILIKE $${values.length}`;
    }

    if (params.isFeatured !== undefined) {
      values.push(params.isFeatured);
      whereClause += ` AND p.is_featured = $${values.length}`;
    }

    if (params.categorySlug) {
      values.push(params.categorySlug);
      whereClause += `
        AND EXISTS (
          SELECT 1 FROM product_categories pc
          JOIN categories cat ON cat.id = pc.category_id AND cat.is_active = true
          WHERE pc.product_id = p.id AND cat.slug = $${values.length}
        )`;
    }

    let orderClause = `ORDER BY p.created_at DESC, p.id DESC`;

    if (params.sort === ProductSortEnum.PRICE_ASC) {
      orderClause = `ORDER BY COALESCE(v.sale_price, v.price) ASC, p.created_at DESC, p.id DESC`;
    }

    if (params.sort === ProductSortEnum.PRICE_DESC) {
      orderClause = `ORDER BY COALESCE(v.sale_price, v.price) DESC, p.created_at DESC, p.id DESC`;
    }

    values.push(MediaAssetRefType.PRODUCT);
    const mediaAssetRefTypeParamIndex = values.length;

    values.push(ProductImageType.MAIN);
    const mainImageTypeParamIndex = values.length;

    values.push(limit);
    const limitParamIndex = values.length;

    values.push(offset);
    const offsetParamIndex = values.length;

    const query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.is_featured,
        p.is_bestseller,
        v.id as variant_id,
        v.price,
        v.sale_price,
        CASE WHEN v.stock_quantity > 0 THEN 1 ELSE 0 END AS in_stock,
        (
          SELECT ma.url 
          FROM product_images pi
          JOIN media_assets ma ON ma.ref_type = $${mediaAssetRefTypeParamIndex} 
            AND ma.ref_id = pi.id::text
            AND ma.is_active = true
          WHERE pi.product_id = p.id 
            AND pi.is_active = true 
          ORDER BY pi.image_type = $${mainImageTypeParamIndex} DESC, pi.display_order ASC
          LIMIT 1
        ) AS main_image
      FROM products p
      JOIN LATERAL (
        SELECT pv.*
        FROM product_variants pv
        WHERE 
          pv.product_id = p.id 
          AND pv.is_active = true
          AND pv.is_default = true
        ORDER BY COALESCE(pv.sale_price, pv.price) ASC
        LIMIT 1
      ) v ON true

      ${whereClause}
      ${orderClause}

      LIMIT $${limitParamIndex}
      OFFSET $${offsetParamIndex}
    `;

    const items = await this.dataSource.query<RawProductRow[]>(query, values);

    const countQuery = `
      SELECT COUNT(*) 
      FROM products p 
      JOIN LATERAL (
        SELECT 1
        FROM product_variants pv
        WHERE pv.product_id = p.id 
          AND pv.is_active = true
          AND pv.is_default = true
        LIMIT 1
      ) v ON true
      ${whereClause}
    `;

    const totalResult = await this.dataSource.query<{ count: string }[]>(
      countQuery,
      values.slice(0, values.length - 4),
    );

    const total = Number(totalResult[0].count);

    return { items, total };
  }

  async findOneForStorefront(slug: string): Promise<ProductDetailsRaw | null> {
    const result = await this.dataSource.query<ProductDetailsRaw[]>(
      `
        SELECT 
          p.id,
          p.name,
          p.slug,
          p.short_description AS "shortDescription",
          p.long_description AS "longDescription",

          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pv.id, 
                'name', pv.name,
                'price', pv.price,
                'salePrice', pv.sale_price,
                'stockQuantity', pv.stock_quantity,
                'isDefault', pv.is_default,

                'attributes', (
                  SELECT COALESCE(
                    json_agg(
                      jsonb_build_object(
                        'id', va.id,
                        'productAttributeId', va.product_attribute_id,
                        'attributeValue', va.attribute_value,
                        'attributeValueDisplay', va.attribute_value_display
                      )
                    ), '[]'
                  )
                  FROM variant_attributes va
                  WHERE va.variant_id = pv.id AND va.is_active = true
                )
              )
            ) FILTER (WHERE pv.id IS NOT NULL), '[]'
          ) AS variants,

          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pa.id, 
                'attributeKey', pa.attribute_key,
                'attributeKeyDisplay', pa.attribute_key_display,
                'displayOrder', pa.display_order
              )
            ) FILTER (WHERE pa.id IS NOT NULL), '[]'
          ) AS attributes,

          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', ma.id, 
                'url', ma.url,
                'imageType', pi.image_type,
                'displayOrder', pi.display_order
              )
            ) FILTER (WHERE ma.id IS NOT NULL), '[]'
          ) AS images

        FROM products p
        LEFT JOIN product_variants pv 
          ON p.id = pv.product_id AND pv.is_active = true

        LEFT JOIN product_images pi 
          ON p.id = pi.product_id AND pi.is_active = true

        LEFT JOIN media_assets ma 
          ON ma.ref_type = $1 
          AND ma.ref_id = pi.id::text 
          AND ma.is_active = true

        LEFT JOIN product_attributes pa 
          ON p.id = pa.product_id AND pa.is_active = true

        WHERE 
          p.slug = $2
          AND p.is_active = true

        GROUP BY p.id
        LIMIT 1
      `,
      [MediaAssetRefType.PRODUCT, slug],
    );

    return result[0] ?? null;
  }
}
