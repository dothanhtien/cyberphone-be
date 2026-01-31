import { Exclude, Expose } from 'class-transformer';
import {
  BeforeInsert,
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
  description?: string;

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  @Expose()
  parentId?: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'fk_categories_parent_id',
  })
  @Exclude()
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  @Expose()
  children: Category[];

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
