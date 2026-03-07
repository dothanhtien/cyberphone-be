import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { CartStatus } from '../enums';

@Entity('carts')
@Index('idx_carts_user_id', ['userId'], { where: '"user_id" IS NOT NULL' })
export class Cart {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'pk_carts_id' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'session_id', length: 100 })
  sessionId: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: CartStatus.ACTIVE,
  })
  status: CartStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 100,
  })
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

  @ManyToOne(() => User, (user) => user.cart, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_carts_user_id' })
  user: User | null;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @OneToMany(() => Order, (order) => order.cart)
  orders: Order[];
}
