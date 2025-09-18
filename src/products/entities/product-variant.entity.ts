import { Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
@Index('idx_product_variants_product_id', ['productId'])
@Index('idx_product_variants_sku', ['sku'])
@Index('idx_product_variants_slug', ['slug'])
@Index('idx_product_variants_is_active', ['isActive'])
@Index('idx_product_variants_created_at', ['createdAt'])
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'decimal', name: 'base_price', precision: 12, scale: 2 })
  basePrice: string;

  @Column({
    type: 'decimal',
    name: 'sale_price',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salePrice?: string;

  @Column({
    type: 'decimal',
    name: 'cost_price',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  costPrice?: string;

  @Column({
    type: 'decimal',
    name: 'weight_kg',
    precision: 6,
    scale: 3,
    default: 0.0,
  })
  weightKg: string;

  @Column({ type: 'int', name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', name: 'low_stock_threshold', default: 5 })
  lowStockThreshold: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  @Expose()
  isActive: boolean;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
    default: () => 'now()',
  })
  @Expose()
  createdAt: Date;

  @Column({ type: 'varchar', name: 'created_by', length: 100, nullable: true })
  @Expose()
  createdBy?: string;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
    nullable: true,
  })
  @Expose()
  updatedAt?: Date | null;

  @Column({ type: 'varchar', name: 'updated_by', length: 100, nullable: true })
  @Expose()
  updatedBy?: string;

  @BeforeInsert()
  resetUpdatedAt() {
    this.updatedAt = null;
  }
}
