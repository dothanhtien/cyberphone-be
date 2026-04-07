import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentProvider, PaymentStatus } from '../enums';

@Entity('payments')
@Index('idx_payments_order_id', ['orderId'])
@Index('idx_payments_transaction_id', ['transactionId'], { unique: true })
@Index('idx_payments_provider', ['provider'])
@Index('idx_payments_status', ['status'])
@Index('idx_payments_paid_at', ['paidAt'])
@Index('idx_payments_created_at', ['createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_payments_id',
  })
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  transactionId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', length: 3, default: 'VND' })
  currency: string = 'VND';

  @Column({ name: 'order_info', type: 'varchar', nullable: true })
  orderInfo: string | null;

  @Column({ type: 'varchar', length: 50 })
  provider: PaymentProvider;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paymentMethod: string | null;

  @Column({ type: 'varchar', length: 50, default: PaymentStatus.PENDING })
  status: PaymentStatus = PaymentStatus.PENDING;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ name: 'raw_response', type: 'jsonb', nullable: true })
  rawResponse: Record<string, any> | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'refunded_at', type: 'timestamptz', nullable: true })
  refundedAt: Date | null;

  @Column({
    name: 'refund_transaction_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  refundTransactionId: string | null;

  @Column({
    name: 'confirmed_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  confirmedBy: string | null;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'order_id',
    foreignKeyConstraintName: 'fk_payments_order_id',
  })
  order: Order;
}
