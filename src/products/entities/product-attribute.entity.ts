import {
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

@Entity('product_attributes')
@Index('idx_product_attributes_product_id', ['productId'])
@Index(
  'uq_product_attributes_product_id_attribute_key_is_active',
  ['productId', 'attributeKey'],
  {
    unique: true,
    where: `"is_active" = true`,
  },
)
@Index(
  'uq_product_attributes_product_id_attribute_key_display_order',
  ['productId', 'attributeKey', 'displayOrder'],
  { unique: true },
)
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_product_attributes_id',
  })
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'fk_product_attributes_product_id',
  })
  product: Product;

  @Column({ name: 'attribute_key', length: 255 })
  attributeKey: string;

  @Column({ name: 'attribute_key_display', length: 255 })
  attributeKeyDisplay: string;

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 100,
  })
  createdBy: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  updatedBy?: string | null;
}
