import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Identity } from '../../identities/entities';
import { Gender } from '../enums';

@Entity('customers')
@Index('uq_customers_phone_active', ['phone'], {
  unique: true,
  where: `"is_active" = true`,
})
@Index('uq_customers_email_active', ['email'], {
  unique: true,
  where: `"is_active" = true`,
})
export class Customer {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_customers_id',
  })
  id: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  lastName: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    default: Gender.OTHER,
  })
  gender: Gender | null;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin?: Date | null;

  @Column({ name: 'phone_verified', type: 'boolean', default: false })
  phoneVerified: boolean = false;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean = false;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean = true;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  createdBy: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  updatedBy: string | null;

  @OneToMany(() => Identity, (i) => i.customer)
  identities: Identity[];
}
