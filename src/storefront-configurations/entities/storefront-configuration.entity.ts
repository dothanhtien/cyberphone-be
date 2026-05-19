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
import { Category } from '../../categories/entities/category.entity';
import { StorefrontConfigurationType } from '../enums';

@Entity('storefront_configurations')
@Index('uq_storefront_configurations_type_key', ['type', 'key'], {
  unique: true,
  where: '"key" IS NOT NULL',
})
@Index(
  'uq_storefront_configurations_type_category_id',
  ['type', 'categoryId'],
  { unique: true, where: '"category_id" IS NOT NULL' },
)
export class StorefrontConfiguration {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_storefront_configurations_id',
  })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  type: StorefrontConfigurationType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  key: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string | null;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ name: 'display_order', type: 'int' })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean = true;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  updatedBy: string | null;

  @ManyToOne(() => Category, { nullable: true, eager: false })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'fk_storefront_configurations_category_id',
  })
  category: Category | null;
}
