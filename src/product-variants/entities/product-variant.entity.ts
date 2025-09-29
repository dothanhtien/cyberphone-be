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
import { Product } from '../../products/entities/product.entity';

@Entity('product_variants')
@Index('idx_product_variants_product_id', ['productId'])
@Index('idx_product_variants_is_active', ['isActive'])
@Index('idx_product_variants_created_at', ['createdAt'])
@Index('uq_product_variants_sku_active', ['sku'], {
  unique: true,
  where: `"is_active" = true`,
})
@Index('uq_product_variants_slug_active', ['slug'], {
  unique: true,
  where: `"is_active" = true`,
})
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_product_variants_id',
  })
  @Expose()
  id: string;

  @Column({ type: 'uuid', name: 'product_id' })
  @Expose()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'fk_product_variants_product_id',
  })
  product: Product;

  @Column({ type: 'varchar', length: 100 })
  @Expose()
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  slug: string;

  @Column({ type: 'decimal', name: 'base_price', precision: 12, scale: 2 })
  @Expose()
  basePrice: string;

  @Column({
    type: 'decimal',
    name: 'sale_price',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  @Expose()
  salePrice?: string;

  @Column({
    type: 'decimal',
    name: 'cost_price',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  @Expose()
  costPrice?: string;

  @Column({
    type: 'decimal',
    name: 'weight_kg',
    precision: 6,
    scale: 3,
    nullable: true,
  })
  @Expose()
  weightKg?: string;

  @Column({ type: 'int', name: 'stock_quantity', nullable: true })
  @Expose()
  stockQuantity?: number;

  @Column({ type: 'int', name: 'low_stock_threshold', nullable: true })
  @Expose()
  lowStockThreshold?: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  @Expose()
  isActive: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'now()',
  })
  @Expose()
  createdAt: Date;

  @Column({ type: 'varchar', name: 'created_by', length: 100 })
  @Expose()
  createdBy: string;

  @UpdateDateColumn({
    type: 'timestamp',
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
