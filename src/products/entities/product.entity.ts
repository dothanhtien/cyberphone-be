import { Expose } from 'class-transformer';
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';
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

@Entity('products')
@Index('idx_products_slug', ['slug'], {
  unique: true,
  where: `"is_active" = true`,
})
@Index('idx_products_name', ['name'])
@Index('idx_products_is_active', ['isActive'])
@Index('idx_products_created_at', ['createdAt'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ length: 255 })
  @Expose()
  name: string;

  @Column({ length: 255 })
  @Expose()
  slug: string;

  @Column({ name: 'short_description', length: 500, nullable: true })
  shortDescription?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'meta_title', length: 255, nullable: true })
  metaTitle?: string;

  @Column({ name: 'meta_description', length: 500, nullable: true })
  metaDescription?: string;

  @Column({ type: 'uuid', name: 'brand_id' })
  brandId: string;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

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
