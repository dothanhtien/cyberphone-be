import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  OTHER = 'other',
}

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
    enum: MediaType,
    default: MediaType.OTHER,
  })
  @Expose()
  resourceType: MediaType;

  @Column({ name: 'ref_type', type: 'varchar', length: 100 })
  @Expose()
  refType: string;

  @Column({ name: 'ref_id', type: 'varchar', length: 100 })
  @Expose()
  refId: string;

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true,
    default: null,
  })
  @Expose()
  metadata?: Record<string, any>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'now()',
  })
  @Expose()
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  @Expose()
  createdBy: string;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  @Expose()
  updatedAt?: Date | null;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  @Expose()
  updatedBy?: string;

  @Column({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  @Expose()
  deletedAt?: Date | null;

  @Column({ name: 'deleted_by', type: 'varchar', length: 100, nullable: true })
  @Expose()
  deletedBy?: string;
}
