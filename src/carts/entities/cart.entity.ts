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
import { CartItem } from './cart-item.entity';
import { CartStatus } from '../enums';
import { Customer } from '../../customers/entities';
import { Order } from '../../orders/entities/order.entity';

@Entity('carts')
@Index('idx_carts_customer_id', ['customerId'])
@Index('uq_active_cart_per_customer', ['customerId'], {
  unique: true,
  where: `"status" = '${CartStatus.ACTIVE}' AND "customer_id" IS NOT NULL`,
})
export class Cart {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'pk_carts_id' })
  id: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string | null;

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
  status: CartStatus = CartStatus.ACTIVE;

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

  @ManyToOne(() => Customer, (customer) => customer.carts, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'customer_id',
    foreignKeyConstraintName: 'fk_carts_customer_id',
  })
  customer: Customer | null;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @OneToMany(() => Order, (order) => order.cart)
  orders: Order[];
}
