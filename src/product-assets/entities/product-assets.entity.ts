import { Exclude, Expose } from 'class-transformer';
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
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';

export enum ImageTypes {
  THUMBNAIL = 'thumbnail',
  GALLERY = 'gallery',
}

@Entity('product_assets')
@Index('idx_product_assets_product_id', ['productId'])
@Index('idx_product_assets_sort_order', ['sortOrder'])
@Index('idx_product_assets_type', ['type'])
@Index('idx_product_assets_product_id_sort_order', ['productId', 'sortOrder'])
export class ProductAsset {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_product_assets_id',
  })
  @Expose()
  id: string;

  @Column({ type: 'uuid', name: 'product_id' })
  @Expose()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'fk_product_assets_product_id',
  })
  product: Product;

  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  @Expose()
  variantId: string | null;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({
    name: 'variant_id',
    foreignKeyConstraintName: 'fk_product_assets_variant_id',
  })
  variant: ProductVariant;

  @Column({ type: 'varchar', name: 'url', length: 512 })
  @Exclude()
  private privateUrl: string;

  @Column({
    type: 'enum',
    enum: ImageTypes,
    enumName: 'image_types_enum',
    default: ImageTypes.GALLERY,
  })
  @Expose()
  type: ImageTypes;

  @Column({ type: 'varchar', name: 'alt_text', length: 255, nullable: true })
  @Expose()
  altText: string | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  @Expose()
  sortOrder: number;

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
  updatedAt: Date | null;

  @Column({ type: 'varchar', name: 'updated_by', length: 100, nullable: true })
  @Expose()
  updatedBy: string | null;

  @BeforeInsert()
  resetUpdatedAt() {
    this.updatedAt = null;
  }

  @Expose()
  get url(): string {
    const baseUrl = process.env.APP_URL;
    return `${baseUrl}/${this.privateUrl?.replace(/^\/?/, '')}`;
  }

  set url(path: string) {
    this.privateUrl = path;
  }
}
