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
import { ProductVariant } from './product-variant.entity';
import { ProductAttribute } from '../../products/entities/product-attribute.entity';

@Entity('variant_attributes')
@Index(
  'uq_variant_attributes_variant_id_product_attribute_id_active',
  ['variantId', 'productAttributeId'],
  {
    unique: true,
    where: `"is_active" = true`,
  },
)
@Index('idx_variant_attributes_variant_id', ['variantId'])
@Index('idx_variant_attributes_product_attribute_id', ['productAttributeId'])
export class VariantAttribute {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_variant_attributes_id',
  })
  id: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @ManyToOne(() => ProductVariant, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'variant_id',
    foreignKeyConstraintName: 'fk_variant_attributes_variant_id',
  })
  variant: ProductVariant;

  @Column({ name: 'product_attribute_id', type: 'uuid' })
  productAttributeId: string;

  @ManyToOne(() => ProductAttribute, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_attribute_id',
    foreignKeyConstraintName: 'fk_variant_attributes_product_attribute_id',
  })
  productAttribute: ProductAttribute;

  @Column({ name: 'attribute_value', length: 255 })
  attributeValue: string;

  @Column({
    name: 'attribute_value_display',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  attributeValueDisplay: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
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
  updatedBy: string | null;
}
