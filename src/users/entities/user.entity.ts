import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Role } from './role.entity';
import { Cart } from '../../carts/entities/cart.entity';
import { Order } from '../../orders/entities/order.entity';

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

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  @Expose()
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  @Expose()
  lastName: string;

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

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];
}
