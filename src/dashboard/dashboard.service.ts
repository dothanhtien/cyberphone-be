import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import dayjs from 'dayjs';
import { Order } from '@/orders/entities/order.entity';
import { ProductVariant } from '@/product-variants/entities/product-variant.entity';
import { OrderStatus } from '@/orders/enums';
import { PaymentStatus } from '@/payment/enums';
import { CategorySalesRow, RevenueRow } from './types';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    private readonly dataSource: DataSource,
  ) {}

  async getSummary() {
    const startOfMonth = dayjs().startOf('month').toDate();

    const raw = (await this.orderRepository
      .createQueryBuilder('o')
      .leftJoin('payments', 'p', 'p.orderId = o.id')
      .select([
        `
      COUNT(*) FILTER (
        WHERE o.orderStatus = :orderStatus
        AND (o.createdAt >= :startOfMonth OR o.updatedAt >= :startOfMonth)
      ) as total_orders
      `,
        `
      COALESCE(
        SUM(p.amount) FILTER (
          WHERE p.status = :paymentStatus
          AND (o.createdAt >= :startOfMonth OR o.updatedAt >= :startOfMonth)
        ), 0
      ) as total_revenue
      `,
      ])
      .setParameters({
        startOfMonth,
        orderStatus: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.SUCCESS,
      })
      .getRawOne()) as {
      total_orders: string;
      total_revenue: string;
    };

    const lowStockProducts = await this.productVariantRepository
      .createQueryBuilder('v')
      .where('v.stockQuantity <= v.lowStockThreshold')
      .andWhere('v.isActive = true')
      .getCount();

    return {
      totalOrders: Number(raw.total_orders),
      totalRevenue: Number(raw.total_revenue),
      lowStockProducts,
    };
  }

  async getRevenue() {
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

    const raw: RevenueRow[] = await this.dataSource.query(
      `
        SELECT
          d::date as date,
          COALESCE(SUM(p.amount),0) as revenue
        FROM generate_series($1::date, CURRENT_DATE, interval '1 day') d
        LEFT JOIN orders o
          ON DATE(o."created_at") = d
          AND o."order_status" = $2
        LEFT JOIN payments p
          ON p."order_id" = o.id
          AND p.status = $3
        GROUP BY d
        ORDER BY d
      `,
      [startOfMonth, OrderStatus.COMPLETED, PaymentStatus.SUCCESS],
    );

    return raw.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
    }));
  }

  async getTopCategorySales() {
    const raw = await this.orderRepository
      .createQueryBuilder('o')
      .innerJoin('order_items', 'oi', 'oi.orderId = o.id')
      .innerJoin('product_variants', 'v', 'v.id = oi.variantId')
      .innerJoin('products', 'p', 'p.id = v.productId')
      .innerJoin('product_categories', 'pc', 'pc.productId = p.id')
      .innerJoin('categories', 'c', 'c.id = pc.categoryId')
      .select(['c.name as category', 'SUM(oi.quantity) as total'])
      .where('o.orderStatus = :status', {
        status: OrderStatus.COMPLETED,
      })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .orderBy('total', 'DESC')
      .limit(3)
      .getRawMany<CategorySalesRow>();

    return raw.map((r) => ({
      category: r.category,
      total: Number(r.total),
    }));
  }
}
