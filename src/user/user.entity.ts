import {
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
  id: string;

  @Column({ type: 'varchar', length: 320, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
  phone?: string;

  @Column({ type: 'text' })
  password_hash: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'text', nullable: true })
  avatar_url?: string;

  @Column({
    type: 'enum',
    enum: UserRoles,
    enumName: 'user_roles_enum',
    default: UserRoles.CUSTOMER,
  })
  role: UserRoles;

  @Column({ type: 'timestamp', nullable: true })
  last_login?: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'now()',
  })
  created_at: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by?: string;

  @UpdateDateColumn({ type: 'timestamp without time zone', nullable: true })
  updated_at: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updated_by?: string;
}
