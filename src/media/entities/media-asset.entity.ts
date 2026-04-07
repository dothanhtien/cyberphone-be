import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  MediaAssetRefType,
  MediaAssetResourceType,
  MediaAssetUsageType,
} from '../../common/enums';

@Entity('media_assets')
@Index('idx_media_assets_ref_type_ref_id', ['refType', 'refId'])
@Index('unq_media_assets_public_id', ['publicId'], {
  unique: true,
})
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_media_assets_id',
  })
  @Expose()
  id: string;

  @Column({ name: 'public_id', type: 'varchar', length: 255 })
  @Expose()
  publicId: string;

  @Column('text')
  @Expose()
  url: string;

  @Column({
    name: 'resource_type',
    type: 'enum',
    enum: MediaAssetResourceType,
    default: MediaAssetResourceType.OTHER,
  })
  @Expose()
  resourceType: MediaAssetResourceType = MediaAssetResourceType.OTHER;

  @Column({ name: 'ref_type', type: 'varchar', length: 100 })
  @Expose()
  refType: MediaAssetRefType;

  @Column({ name: 'ref_id', type: 'varchar', length: 100 })
  @Expose()
  refId: string;

  @Column({ name: 'usage_type', type: 'varchar', length: 100 })
  @Expose()
  usageType: MediaAssetUsageType;

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true,
    default: null,
  })
  @Expose()
  metadata: Record<string, any> | null = null;

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
