import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Identity } from '../../identities/entities';

@Entity('refresh_tokens')
@Index('idx_refresh_tokens_identity_id', ['identityId'])
@Index('idx_refresh_tokens_expires_at', ['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_refresh_tokens_id',
  })
  id: string;

  @Column({ name: 'identity_id', type: 'uuid' })
  identityId: string;

  @Column({ name: 'token_hash', type: 'text' })
  tokenHash: string;

  @Column({ name: 'device_id', type: 'varchar', length: 255 })
  deviceId: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'replaced_by_token', type: 'uuid', nullable: true })
  replacedByToken: string | null;

  @Column({ nullable: true })
  ip: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'device_type', type: 'varchar', length: 50, nullable: true })
  deviceType: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  os: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => Identity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'identity_id',
    foreignKeyConstraintName: 'fk_refresh_tokens_identity_id',
  })
  identity: Identity;
}
