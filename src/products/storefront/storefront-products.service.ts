import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FilterProductsDto } from './dto';
import { extractPaginationParams } from '@/common/utils';
import { ProductSortEnum } from './enums';
import { ProductDetailsRaw, RawProductRow } from './types';
import { mapToStorefrontProductResponse } from './mappers';
import { MediaAssetRefType, ProductImageType } from '@/common/enums';

@Injectable()
export class StorefrontProductsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(params: FilterProductsDto) {
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

    let orderClause = `ORDER BY p.created_at DESC`;

    if (params.sort === ProductSortEnum.PRICE_ASC) {
      orderClause = `ORDER BY COALESCE(v.sale_price, v.price) ASC`;
    }

    if (params.sort === ProductSortEnum.PRICE_DESC) {
      orderClause = `ORDER BY COALESCE(v.sale_price, v.price) DESC`;
    }

    const query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.short_description,
        v.id as variant_id,
        v.price,
        v.sale_price,
        CASE WHEN v.stock_quantity > 0 THEN 1 ELSE 0 END AS in_stock,
        (
          SELECT ma.url 
          FROM product_images pi
          JOIN media_assets ma ON pi.id = ma.ref_id::uuid
          WHERE pi.product_id = p.id AND pi.is_active = true AND ma.is_active = true
          ORDER BY pi.image_type = '${ProductImageType.MAIN}' DESC, pi.display_order ASC
          LIMIT 1
        ) AS main_image
      FROM products p
      JOIN LATERAL (
        SELECT pv.*
        FROM product_variants pv
        WHERE pv.product_id = p.id AND pv.is_active = true
        ORDER BY COALESCE(pv.sale_price, pv.price) ASC
        LIMIT 1
      ) v ON true

      ${whereClause}
      ${orderClause}

      LIMIT ${limit} OFFSET ${offset}
    `;

    const products = await this.dataSource.query<RawProductRow[]>(
      query,
      values,
    );

    const countQuery = `SELECT COUNT(*) FROM products p ${whereClause}`;

    const totalResult = await this.dataSource.query<{ count: string }[]>(
      countQuery,
      values,
    );

    const total = Number(totalResult[0].count);

    return {
      items: products.map(mapToStorefrontProductResponse),
      totalCount: total,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(slug: string) {
    const products = await this.dataSource.query<ProductDetailsRaw[]>(
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
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_active = true
        LEFT JOIN media_assets ma ON ma.ref_type = $1 AND ma.ref_id = pi.id::text
        LEFT JOIN product_attributes pa ON p.id = pa.product_id AND pa.is_active = true
        WHERE 
          p.slug = $2
          AND p.is_active = true
        GROUP BY p.id
        LIMIT 1
      `,
      [MediaAssetRefType.PRODUCT, slug],
    );

    return products[0] ?? null;
  }
}
