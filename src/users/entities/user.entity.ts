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
import { Exclude, Expose } from 'class-transformer';
import { Role } from './role.entity';

@Entity('users')
@Index('uq_users_phone_active', ['phone'], {
  unique: true,
  where: `"is_active" = true`,
})
@Index('uq_users_username_active', ['username'], {
  unique: true,
  where: `"is_active" = true`,
})
export class User {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_users_id',
  })
  @Expose()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  username: string;

  @Column({ type: 'varchar', length: 30 })
  @Expose()
  phone: string;

  @Column({ name: 'password_hash', type: 'text' })
  @Exclude()
  passwordHash: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  @Expose()
  email: string | null;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  @Expose()
  fullName: string;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  @Expose()
  lastLogin?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean = true;

  @Column({ name: 'role_id', type: 'uuid' })
  @Expose()
  roleId: string;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'role_id',
    foreignKeyConstraintName: 'fk_users_role_id',
  })
  role: Role;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  @Expose()
  createdAt: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 100,
  })
  @Expose()
  createdBy: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  @Expose()
  updatedAt?: Date;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @Expose()
  updatedBy: string | null;
}
