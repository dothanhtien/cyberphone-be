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
  id: string;

  @Column({ name: 'public_id', type: 'varchar', length: 255 })
  publicId: string;

  @Column('text')
  url: string;

  @Column({
    name: 'resource_type',
    type: 'enum',
    enum: MediaAssetResourceType,
    default: MediaAssetResourceType.OTHER,
  })
  resourceType: MediaAssetResourceType = MediaAssetResourceType.OTHER;

  @Column({ name: 'ref_type', type: 'varchar', length: 100 })
  refType: MediaAssetRefType;

  @Column({ name: 'ref_id', type: 'varchar', length: 100 })
  refId: string;

  @Column({ name: 'usage_type', type: 'varchar', length: 100 })
  usageType: MediaAssetUsageType;

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true,
    default: null,
  })
  metadata: Record<string, any> | null = null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean = true;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  updatedBy: string | null;
}
