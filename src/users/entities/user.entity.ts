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

export enum UserRoles {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALE = 'sale',
  CUSTOMER = 'customer',
}

@Entity('users')
@Index('uq_users_email_active', ['email'], {
  unique: true,
  where: `"is_active" = true`,
})
@Index('uq_users_phone_active', ['phone'], {
  unique: true,
  where: `"is_active" = true`,
})
export class User {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'pk_users_id' })
  @Expose()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  @Expose()
  phone?: string;

  @Column({ type: 'text', name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({ type: 'varchar', name: 'full_name', length: 255 })
  @Expose()
  fullName: string;

  @Column({ type: 'text', name: 'avatar_url', nullable: true })
  @Expose()
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: UserRoles,
    enumName: 'user_roles_enum',
    default: UserRoles.CUSTOMER,
  })
  @Expose()
  role: UserRoles;

  @Column({ type: 'timestamp', name: 'last_login', nullable: true })
  @Expose()
  lastLogin?: Date;

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

  @Column({ type: 'varchar', name: 'created_by', length: 100, nullable: true })
  @Expose()
  createdBy?: string;

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
