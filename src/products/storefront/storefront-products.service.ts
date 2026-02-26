import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FilterProductsDto } from './dto/requests/filter-products.dto';
import { extractPaginationParams } from '@/common/utils/paginations.util';
import { ProductSortEnum } from './enums';
import { RawProductRow } from './types';
import { mapToStorefrontProductResponse } from './mappers/product.mapper';

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
        v.price,
        v.sale_price,
        CASE WHEN v.stock_quantity > 0 THEN 1 ELSE 0 END AS in_stock,
        (
          SELECT ma.url 
          FROM product_images pi
          JOIN media_assets ma ON pi.id = ma.ref_id::uuid
          WHERE pi.product_id = p.id
            AND pi.is_active = true
          ORDER BY pi.image_type = 'main' DESC, pi.display_order ASC
          LIMIT 1
        ) AS main_image
      FROM products p
      LEFT JOIN LATERAL (
        SELECT pv.*
        FROM product_variants pv
        WHERE pv.product_id = p.id
          AND pv.is_active = true
        ORDER BY 
          COALESCE(pv.sale_price, pv.price) ASC
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
}
