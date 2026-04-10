import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VariantAttribute } from './variant-attribute.entity';
import { CartItem } from '../../carts/entities';
import { ProductVariantStockStatus } from '../../common/enums';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Product } from '../../products/entities';

@Entity('product_variants')
@Index('uq_product_variants_sku_active', ['sku'], {
  unique: true,
  where: `"is_active" = true`,
})
@Index('uq_product_variants_product_default', ['productId'], {
  unique: true,
  where: `"is_default" = true AND "is_active" = true`,
})
@Index('idx_product_variants_product_id', ['productId'])
@Index('idx_product_variants_stock_status', ['stockStatus'])
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_product_variants_id',
  })
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'fk_product_variants_product_id',
  })
  product: Product;

  @Column({ length: 100 })
  sku: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string;

  @Column({
    name: 'sale_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salePrice: string | null;

  @Column({
    name: 'cost_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  costPrice: string | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number = 0;

  @Column({
    name: 'stock_status',
    type: 'varchar',
    length: 100,
    default: ProductVariantStockStatus.IN_STOCK,
  })
  stockStatus: string = ProductVariantStockStatus.IN_STOCK;

  @Column({ name: 'low_stock_threshold', type: 'int', default: 5 })
  lowStockThreshold: number = 5;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean = false;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean = true;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  updatedBy: string | null;

  @OneToMany(
    () => VariantAttribute,
    (variantAttribute) => variantAttribute.variant,
  )
  attributes: VariantAttribute[];

  @OneToMany(() => CartItem, (item) => item.variant)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (item) => item.variant)
  orderItems: OrderItem[];
}
