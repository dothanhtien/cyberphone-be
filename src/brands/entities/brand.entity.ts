import { Exclude, Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  description?: string;

  @Column({ type: 'varchar', name: 'website_url', length: 512, nullable: true })
  @Expose()
  websiteUrl?: string;

  @Column({ type: 'varchar', name: 'logo_url', length: 512, nullable: true })
  @Exclude()
  private logoPath: string | null;

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

  @Column({ type: 'varchar', name: 'created_by', length: 100 })
  @Expose()
  createdBy: string;

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

  getLogoPath(): string | null {
    return this.logoPath;
  }
}
