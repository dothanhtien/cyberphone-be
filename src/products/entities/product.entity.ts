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
import { Brand } from '../../brands/entities/brand.entity';
import { ProductCategory } from './product-category.entity';

@Entity('products')
@Index('uq_products_slug_active', ['slug'], {
  unique: true,
  where: `"is_active" = true`,
})
export class Product {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_products_id',
  })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  slug: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string;

  @Column({ name: 'long_description', type: 'text', nullable: true })
  longDescription?: string;

  @Column({ length: 100 })
  status: string;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean = false;

  @Column({ name: 'is_bestseller', type: 'boolean', default: false })
  isBestseller: boolean = false;

  @Column({ name: 'brand_id', type: 'uuid' })
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
  isActive: boolean = true;

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
  updatedBy: string | null;

  @OneToMany(
    () => ProductCategory,
    (productCategory) => productCategory.product,
  )
  productCategories: ProductCategory[];
}
