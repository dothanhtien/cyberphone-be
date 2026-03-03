import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';

@Entity('order_items')
@Index('idx_order_items_order_id', ['orderId'])
@Index('idx_order_items_variant_id', ['variantId'])
@Index('idx_order_items_product_id', ['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_order_items_id',
  })
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  productName: string;

  @Column({ name: 'variant_name', type: 'varchar', length: 255 })
  variantName: string;

  @Column({ name: 'sku', type: 'varchar', length: 100 })
  sku: string;

  @Column({ name: 'attributes', type: 'json', nullable: true })
  attributes: Record<string, any> | null;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: string;

  @Column({
    name: 'sale_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salePrice: string | null;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'item_total', type: 'decimal', precision: 12, scale: 2 })
  itemTotal: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'order_id',
    foreignKeyConstraintName: 'fk_order_items_order_id',
  })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'fk_order_items_product_id',
  })
  product: Product;

  @ManyToOne(() => ProductVariant, (variant) => variant.orderItems, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'variant_id',
    foreignKeyConstraintName: 'fk_order_items_variant_id',
  })
  variant: ProductVariant;
}
