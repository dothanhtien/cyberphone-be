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
import { ProductCategory } from '../../products/entities';

@Entity('categories')
@Index('uq_categories_slug_active', ['slug'], {
  unique: true,
  where: `"is_active" = true`,
})
export class Category {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_categories_id',
  })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'fk_categories_parent_id',
  })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean = true;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'varchar', name: 'created_by', length: 100 })
  createdBy: string;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column({ type: 'varchar', name: 'updated_by', length: 100, nullable: true })
  updatedBy: string | null;

  @OneToMany(
    () => ProductCategory,
    (productCategory) => productCategory.category,
  )
  productCategories: ProductCategory[];
}
