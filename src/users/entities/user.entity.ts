import { Exclude, Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
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
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Expose()
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
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
