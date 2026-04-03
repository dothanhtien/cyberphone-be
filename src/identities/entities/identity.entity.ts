import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthProvider, IdentityType } from '../enums';
import { User } from '../../users/entities';
import { Customer } from '../../customers/entities';

@Entity('identities')
@Index('uq_identities_type_value_provider', ['type', 'value', 'provider'], {
  unique: true,
})
export class Identity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_identities_id',
  })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  type: IdentityType;

  @Column({ type: 'varchar', length: 320 })
  value: string;

  @Column({ type: 'varchar', length: 50, default: AuthProvider.LOCAL })
  provider: AuthProvider = AuthProvider.LOCAL;

  @Column({ type: 'text', name: 'password_hash', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'boolean', name: 'is_verified', default: false })
  isVerified: boolean = false;

  @ManyToOne(() => User, (user) => user.identities, { nullable: true })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_identities_user_id',
  })
  user?: User;

  @ManyToOne(() => Customer, (customer) => customer.identities, {
    nullable: true,
  })
  @JoinColumn({
    name: 'customer_id',
    foreignKeyConstraintName: 'fk_identities_customer_id',
  })
  customer?: Customer;
}
