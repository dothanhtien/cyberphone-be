import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities';

@Entity('brands')
@Index('uq_brands_slug_active', ['slug'], {
  unique: true,
  where: `"is_active" = true`,
})
export class Brand {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_brands_id',
  })
  @Expose()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  slug: string;

  @Column({ type: 'text', nullable: true })
  @Expose()
  description: string | null;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  @Expose()
  websiteUrl: string | null;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean = true;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Expose()
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  @Expose()
  createdBy: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  @Expose()
  updatedAt: Date | null;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @Expose()
  updatedBy: string | null;
}
