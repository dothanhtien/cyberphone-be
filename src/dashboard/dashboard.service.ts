import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import dayjs from 'dayjs';
import { DateRangeFilterDto, LimitFilterDto } from './dto/requests/filter.dto';
import {
  CategorySalesRaw,
  RecentOrderRaw,
  RevenueRaw,
  SummaryRaw,
  TopProductRaw,
} from './types';
import { MediaAssetRefType, ProductImageType } from '@/common/enums';
import { Order } from '@/orders/entities';
import { OrderStatus } from '@/orders/enums';
import { PaymentStatus } from '@/payment/enums';
import { ProductVariant } from '@/products/entities';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    private readonly dataSource: DataSource,
  ) {}

  async getSummary(filterDto?: DateRangeFilterDto) {
    const { startDate, endDate } = this.getDateRange(filterDto);

    const [summary, lowStockProducts] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('o')
        .leftJoin('payments', 'p', 'p.orderId = o.id')
        .select([
          `
            COUNT(*) FILTER (
              WHERE o.orderStatus = :orderStatus
              AND GREATEST(o.createdAt, o.updatedAt) BETWEEN :startDate AND :endDate
            ) as total_orders
          `,
          `
            COALESCE(
              SUM(p.amount) FILTER (
                WHERE p.status = :paymentStatus
                AND GREATEST(o.createdAt, o.updatedAt) BETWEEN :startDate AND :endDate
              ), 0
            ) as total_revenue
          `,
        ])
        .setParameters({
          startDate,
          endDate,
          orderStatus: OrderStatus.COMPLETED,
          paymentStatus: PaymentStatus.SUCCESS,
        })
        .getRawOne<SummaryRaw>(),
      this.productVariantRepository
        .createQueryBuilder('v')
        .where('v.stockQuantity <= v.lowStockThreshold')
        .andWhere('v.isActive = true')
        .getCount(),
    ]);

    return {
      totalOrders: Number(summary?.total_orders ?? 0),
      totalRevenue: Number(summary?.total_revenue ?? 0),
      lowStockProducts,
    };
  }

  async getRevenue(filterDto?: DateRangeFilterDto) {
    const { startDate, endDate } = this.getDateRange(filterDto);

    const raw: RevenueRaw[] = await this.dataSource.query(
      `
        SELECT
          d::date as date,
          COALESCE(SUM(p.amount),0) as revenue
        FROM generate_series($1::date, $2::date, interval '1 day') d
        LEFT JOIN orders o
          ON o.created_at >= d
            AND o.created_at < d + interval '1 day'
            AND o."order_status" = $3
        LEFT JOIN payments p
          ON p.order_id = o.id
          AND p.status = $4
        GROUP BY d
        ORDER BY d
      `,
      [startDate, endDate, OrderStatus.COMPLETED, PaymentStatus.SUCCESS],
    );

    return raw.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
    }));
  }

  async getTopCategorySales(filterDto?: DateRangeFilterDto) {
    const { startDate, endDate } = this.getDateRange(filterDto);

    const raw: CategorySalesRaw[] = await this.dataSource.query(
      `
        SELECT
          c.name as category,
          SUM(oi.quantity) as total
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN product_variants v ON v.id = oi.variant_id AND v.is_active = true
        JOIN products p ON p.id = v.product_id AND p.is_active = true
        JOIN product_categories pc ON pc.product_id = p.id
        JOIN categories c ON c.id = pc.category_id AND c.is_active = true
        WHERE o.order_status = $1
          AND o.created_at BETWEEN $2 AND $3
        GROUP BY c.id, c.name
        ORDER BY total DESC
        LIMIT 3
      `,
      [OrderStatus.COMPLETED, startDate, endDate],
    );

    return raw.map((r) => ({
      category: r.category,
      total: Number(r.total),
    }));
  }

  async getTopProducts(filterDto?: DateRangeFilterDto & LimitFilterDto) {
    const { startDate, endDate } = this.getDateRange(filterDto);
    const limit = filterDto?.limit ?? 10;

    const raw: TopProductRaw[] = await this.dataSource.query(
      `
        SELECT
          s.id,
          s.name,
          s.total_sales,
          COALESCE(vimg.url, pimg.url) as image_url
        FROM (
          SELECT
            v.id,
            v.name,
            SUM(oi.quantity) as total_sales,
            v.product_id
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          JOIN product_variants v ON v.id = oi.variant_id AND v.is_active = true
          WHERE o.order_status = $1 AND o.created_at BETWEEN $2 AND $3
          GROUP BY v.id, v.name, v.product_id
          ORDER BY total_sales DESC
          LIMIT $4
        ) s

        LEFT JOIN LATERAL (
          SELECT ma.url
          FROM product_images pi
          JOIN media_assets ma ON ma.ref_id::uuid = pi.id
          WHERE pi.variant_id = s.id
            AND pi.image_type = $5
            AND pi.is_active = true
            AND ma.ref_type = $6
            AND ma.is_active = true
          LIMIT 1
        ) vimg ON true

        LEFT JOIN LATERAL (
          SELECT ma.url
          FROM product_images pi
          JOIN media_assets ma ON ma.ref_id::uuid = pi.id
          WHERE pi.product_id = s.product_id
            AND pi.image_type = $5
            AND pi.is_active = true
            AND ma.ref_type = $6
            AND ma.is_active = true
          LIMIT 1
        ) pimg ON true

        ORDER BY s.total_sales DESC
      `,
      [
        OrderStatus.COMPLETED,
        startDate,
        endDate,
        limit,
        ProductImageType.MAIN,
        MediaAssetRefType.PRODUCT,
      ],
    );

    return raw.map((item) => ({
      id: item.id,
      name: item.name,
      totalSales: Number(item.total_sales),
      imageUrl: item.image_url,
    }));
  }

  async getRecentOrders(filterDto: LimitFilterDto) {
    const limit = filterDto.limit ?? 10;

    const raw: RecentOrderRaw[] = await this.dataSource.query(
      `
        SELECT
          o.id,
          o.code,
          o.order_total,
          o.order_status,
          o.payment_status,
          COUNT(oi.id) AS total_items
        FROM orders o
        LEFT JOIN order_items oi 
          ON oi.order_id = o.id
        GROUP BY o.id
        ORDER BY COALESCE(o.updated_at, o.created_at) DESC
        LIMIT $1
      `,
      [limit],
    );

    return raw.map((r) => ({
      id: r.id,
      code: r.code,
      totalAmount: Number(r.order_total),
      orderStatus: r.order_status,
      paymentStatus: r.payment_status,
    }));
  }

  private getDateRange(filterDto?: DateRangeFilterDto) {
    const startDate = filterDto?.startDate
      ? dayjs(filterDto.startDate).startOf('day').toDate()
      : dayjs().startOf('month').toDate();
    const endDate = filterDto?.endDate
      ? dayjs(filterDto.endDate).endOf('day').toDate()
      : dayjs().endOf('day').toDate();
    return { startDate, endDate };
  }
}
