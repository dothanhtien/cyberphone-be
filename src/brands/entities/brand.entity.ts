import { Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Expose()
  slug: string;

  @Column({ type: 'text', nullable: true })
  @Expose()
  description?: string;

  @Column({ type: 'varchar', name: 'website_url', length: 512, nullable: true })
  @Expose()
  websiteUrl?: string;

  @Column({ type: 'varchar', name: 'logo_url', length: 512, nullable: true })
  @Expose()
  logoUrl?: string;

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
