import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { DeviceType, OrderStatus, PaymentMethod } from '../enums';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Cart } from '../../carts/entities/cart.entity';
import { PaymentStatus } from '../../payment/enums';

@Entity('orders')
@Unique('idx_orders_code', ['code'])
@Index('idx_orders_customer_id', ['customerId'])
@Index('idx_orders_order_status', ['orderStatus'])
@Index('idx_orders_payment_status', ['paymentStatus'])
@Index('idx_orders_cart_revision', ['cartId', 'revision'])
export class Order {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_orders_id',
  })
  id: string;

  @Column({ name: 'code', type: 'varchar', length: 50 })
  code: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @Column({ type: 'int', default: 1 })
  revision: number;

  @Column({
    name: 'customer_id',
    type: 'uuid',
    nullable: true,
  })
  customerId: string | null;

  @Column({ name: 'shipping_name', type: 'varchar', length: 255 })
  shippingName: string;

  @Column({ name: 'shipping_phone', type: 'varchar', length: 30 })
  shippingPhone: string;

  @Column({
    name: 'shipping_email',
    type: 'varchar',
    length: 320,
    nullable: true,
  })
  shippingEmail: string | null;

  @Column({ name: 'shipping_address_line1', type: 'varchar', length: 255 })
  shippingAddressLine1: string;

  @Column({
    name: 'shipping_address_line2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  shippingAddressLine2: string | null;

  @Column({ name: 'shipping_city', type: 'varchar', length: 100 })
  shippingCity: string;

  @Column({
    name: 'shipping_state',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  shippingState: string | null;

  @Column({ name: 'shipping_district', type: 'varchar', length: 100 })
  shippingDistrict: string;

  @Column({ name: 'shipping_ward', type: 'varchar', length: 100 })
  shippingWard: string;

  @Column({
    name: 'shipping_postal_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  shippingPostalCode: string | null;

  @Column({
    name: 'shipping_country',
    type: 'varchar',
    length: 100,
    default: 'Vietnam',
  })
  shippingCountry: string;

  @Column({ name: 'shipping_note', type: 'text', nullable: true })
  shippingNote: string | null;

  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  paymentMethod: PaymentMethod;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 50,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'shipping_method', type: 'varchar', length: 100 })
  shippingMethod: string;

  @Column({
    name: 'shipping_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingFee: string;

  @Column({
    name: 'shipping_tracking_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  shippingTrackingCode: string | null;

  @Column({
    name: 'estimated_delivery_date',
    type: 'timestamptz',
    nullable: true,
  })
  estimatedDeliveryDate: Date | null;

  @Column({ name: 'actual_delivery_date', type: 'timestamptz', nullable: true })
  actualDeliveryDate: Date | null;

  @Column({
    name: 'items_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  itemsTotal: string;

  @Column({
    name: 'discount_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  discountTotal: string;

  @Column({
    name: 'tax_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxTotal: string;

  @Column({
    name: 'shipping_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingTotal: string;

  @Column({
    name: 'order_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  orderTotal: string;

  @Column({
    name: 'order_status',
    type: 'varchar',
    length: 50,
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancelled_reason', type: 'text', nullable: true })
  cancelledReason: string | null;

  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  refundAmount: string | null;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason: string | null;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'admin_note', type: 'text', nullable: true })
  adminNote: string | null;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({
    name: 'device_type',
    type: 'varchar',
    length: 50,
    default: DeviceType.UNKNOWN,
  })
  deviceType: DeviceType;

  @Column({
    name: 'is_active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isActive: boolean = true;

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

  @ManyToOne(() => Cart, { nullable: false, onDelete: 'NO ACTION' })
  @JoinColumn({
    name: 'cart_id',
    foreignKeyConstraintName: 'fk_orders_cart_id',
  })
  cart: Cart;

  @ManyToOne(() => User, (user) => user.orders, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'customer_id',
    foreignKeyConstraintName: 'fk_orders_customer_id',
  })
  customer: User | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
