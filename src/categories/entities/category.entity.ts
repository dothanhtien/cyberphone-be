import { Exclude, Expose } from 'class-transformer';
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
  @Expose()
  id: string;

  @Column({ length: 255 })
  @Expose()
  name: string;

  @Column({ length: 255 })
  @Expose()
  slug: string;

  @Column({ type: 'text', nullable: true })
  @Expose()
  description: string | null;

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  @Expose()
  parentId: string | null;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'fk_categories_parent_id',
  })
  @Exclude()
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  @Expose()
  children: Category[];

  @Column({ type: 'boolean', name: 'is_active', default: true })
  @Expose()
  isActive: boolean = true;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Expose()
  createdAt: Date;

  @Column({ type: 'varchar', name: 'created_by', length: 100 })
  @Expose()
  createdBy: string;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', nullable: true })
  @Expose()
  updatedAt: Date | null;

  @Column({ type: 'varchar', name: 'updated_by', length: 100, nullable: true })
  @Expose()
  updatedBy: string | null;

  @OneToMany(
    () => ProductCategory,
    (productCategory) => productCategory.category,
  )
  productCategories: ProductCategory[];
}
