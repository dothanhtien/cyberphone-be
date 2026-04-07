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
import { Cart } from './cart.entity';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';

@Entity('cart_items')
@Index('uq_cart_items_cart_variant_active', ['cartId', 'variantId'], {
  unique: true,
  where: `"is_active" = true`,
})
export class CartItem {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_cart_items_id',
  })
  id: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ type: 'int' })
  quantity: number;

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

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'cart_id',
    foreignKeyConstraintName: 'fk_cart_items_cart_id',
  })
  cart: Cart;

  @ManyToOne(() => ProductVariant, (variant) => variant.cartItems)
  @JoinColumn({
    name: 'variant_id',
    foreignKeyConstraintName: 'fk_cart_items_variant_id',
  })
  variant: ProductVariant;
}
