import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Product } from '.';
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

  @ManyToOne(() => Product, (product) => product.categories, {
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
