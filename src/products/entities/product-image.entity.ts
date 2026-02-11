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
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';
import { ProductImageType } from '../../common/enums';

@Entity('product_images')
@Index('idx_product_images_product_id', ['productId'])
@Index('idx_product_images_variant_id', ['variantId'])
@Index('idx_product_images_image_type', ['imageType'])
export class ProductImage {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_product_images_id',
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
    foreignKeyConstraintName: 'fk_product_images_product_id',
  })
  product: Product;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId: string;

  @ManyToOne(() => ProductVariant, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'variant_id',
    foreignKeyConstraintName: 'fk_product_images_variant_id',
  })
  variant?: ProductVariant | null;

  @Column({
    name: 'image_type',
    type: 'varchar',
    length: 50,
    default: ProductImageType.GALLERY,
  })
  imageType: string;

  @Column({
    name: 'alt_text',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  altText?: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  title?: string | null;

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

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  updatedBy?: string | null;
}
