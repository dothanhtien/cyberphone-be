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
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
@Index('uq_products_slug_active', ['slug'], {
  unique: true,
  where: `"is_active" = true`,
})
@Index('idx_products_name', ['name'])
@Index('idx_products_is_active', ['isActive'])
@Index('idx_products_created_at', ['createdAt'])
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

  @Column({ name: 'short_description', length: 500, nullable: true })
  @Expose()
  shortDescription?: string;

  @Column({ type: 'text', nullable: true })
  @Expose()
  description?: string;

  @Column({ name: 'is_featured', default: false })
  @Expose()
  isFeatured: boolean;

  @Column({ name: 'meta_title', length: 255, nullable: true })
  @Expose()
  metaTitle?: string;

  @Column({ name: 'meta_description', length: 500, nullable: true })
  @Expose()
  metaDescription?: string;

  @Column({ type: 'uuid', name: 'brand_id' })
  @Expose()
  brandId: string;

  @ManyToOne(() => Brand)
  @JoinColumn({
    name: 'brand_id',
    foreignKeyConstraintName: 'fk_products_brand_id',
  })
  brand: Brand;

  @Column({ type: 'uuid', name: 'category_id' })
  @Expose()
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'fk_products_category_id',
  })
  category: Category;

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
