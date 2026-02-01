import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { User } from './user.entity';

@Entity('roles')
@Index('uq_roles_name_active', ['name', 'isActive'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_roles_id',
  })
  @Expose()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string;

  @Column({ type: 'text', nullable: true })
  @Expose()
  description: string | null;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  @Expose()
  isSystem: boolean = false;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean = true;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'now()',
  })
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
  updatedAt: Date;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @Expose()
  updatedBy: string | null;
}
