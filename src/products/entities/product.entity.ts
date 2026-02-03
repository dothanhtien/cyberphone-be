import { Expose } from 'class-transformer';
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
import { Brand } from '../../brands/entities/brand.entity';

@Entity('products')
@Index('uq_products_slug_active', ['slug'], {
  unique: true,
  where: `"is_active" = true`,
})
export class Product {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_products_id',
  })
  @Expose()
  id: string;

  @Column({ length: 255 })
  @Expose()
  name: string;

  @Column({ length: 255 })
  @Expose()
  slug: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  @Expose()
  shortDescription?: string;

  @Column({ name: 'long_description', type: 'text', nullable: true })
  @Expose()
  longDescription?: string;

  @Column({ length: 100 })
  @Expose()
  status: string;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  @Expose()
  isFeatured: boolean = false;

  @Column({ name: 'is_bestseller', type: 'boolean', default: false })
  @Expose()
  isBestseller: boolean = false;

  @Column({ name: 'brand_id', type: 'uuid' })
  @Expose()
  brandId: string;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'brand_id',
    foreignKeyConstraintName: 'fk_products_brand_id',
  })
  brand: Brand;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean = true;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  @Expose()
  createdAt: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 100,
  })
  @Expose()
  createdBy: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  @Expose()
  updatedAt: Date;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @Expose()
  updatedBy: string | null;
}
