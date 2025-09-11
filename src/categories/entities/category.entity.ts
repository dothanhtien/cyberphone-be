import { Exclude, Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ length: 255 })
  @Expose()
  name: string;

  @Column({ length: 255, unique: true })
  @Expose()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', name: 'logo_url', length: 512, nullable: true })
  @Exclude()
  private logoPath: string | null;

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  @Expose()
  parentId?: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  @Expose()
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  @Expose()
  children: Category[];

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

  @Expose()
  get logoUrl(): string | null {
    const baseUrl = process.env.APP_URL;
    if (!this.logoPath || !baseUrl) return null;
    return `${baseUrl}/${this.logoPath.replace(/^\/?/, '')}`;
  }

  set logoUrl(path: string | null) {
    this.logoPath = path ?? null;
  }
}
