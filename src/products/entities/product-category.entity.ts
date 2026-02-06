import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('product_categories')
@Index(
  'uq_product_categories_product_id_category_id',
  ['productId', 'categoryId'],
  { unique: true },
)
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_product_categories_id',
  })
  @Expose()
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  @Expose()
  productId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  @Expose()
  categoryId: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean;

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

  @ManyToOne(() => Product, (product) => product.productCategories, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'fk_product_categories_product_id',
  })
  product: Product;

  @ManyToOne(() => Category, (category) => category.productCategories, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'fk_product_categories_category_id',
  })
  category: Category;
}
