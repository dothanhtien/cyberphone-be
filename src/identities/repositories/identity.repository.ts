import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { IdentityCreateEntity } from '../dto';
import { AuthProvider, IdentityType } from '../enums';
import { Identity } from '../entities';

export interface IIdentityRepository {
  existsByValues({
    values,
    provider,
    tx,
  }: {
    values: string[];
    provider: AuthProvider;
    tx: EntityManager;
  }): Promise<boolean>;
  findOne(
    {
      type,
      value,
      provider,
    }: {
      type: IdentityType;
      value: string;
      provider: AuthProvider;
    },
    tx?: EntityManager,
  ): Promise<Identity | null>;
  findOneByAccountId({
    userId,
    customerId,
    tx,
  }: {
    userId?: string;
    customerId?: string;
    tx?: EntityManager;
  }): Promise<Identity | null>;
  save(data: IdentityCreateEntity, tx: EntityManager): Promise<Identity>;
  findAllIdsByAccountId({
    userId,
    customerId,
    tx,
  }: {
    userId?: string;
    customerId?: string;
    tx?: EntityManager;
  }): Promise<string[]>;
  updatePassword({
    userId,
    customerId,
    passwordHash,
    oldPasswordHash,
    tx,
  }: {
    userId?: string;
    customerId?: string;
    passwordHash: string;
    oldPasswordHash?: string;
    tx?: EntityManager;
  }): Promise<boolean>;
}

export const IDENTITY_REPOSITORY = Symbol('IIdentityRepository');

@Injectable()
export class IdentityRepository implements IIdentityRepository {
  constructor(
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
  ) {}

  existsByValues({
    values,
    provider,
    tx,
  }: {
    values: string[];
    provider: AuthProvider;
    tx: EntityManager;
  }): Promise<boolean> {
    if (!values.length) return Promise.resolve(false);

    return tx.getRepository(Identity).exists({
      where: { value: In(values), provider },
    });
  }

  findOne(
    {
      type,
      value,
      provider,
    }: {
      type: IdentityType;
      value: string;
      provider: AuthProvider;
    },
    tx?: EntityManager,
  ): Promise<Identity | null> {
    const repository = tx
      ? tx.getRepository(Identity)
      : this.identityRepository;

    return repository.findOne({
      where: { type, value, provider },
      relations: ['user', 'user.role', 'customer'],
    });
  }

  findOneByAccountId({
    userId,
    customerId,
    tx,
  }: {
    userId?: string;
    customerId?: string;
    tx?: EntityManager;
  }): Promise<Identity | null> {
    if (!userId && !customerId) return Promise.resolve(null);

    if (userId && customerId) {
      throw new Error(
        'findOneByAccountId requires exactly one of userId or customerId',
      );
    }

    const repo = tx ? tx.getRepository(Identity) : this.identityRepository;
    return repo.findOne({
      where: userId ? { userId } : { customerId },
    });
  }

  async save(data: IdentityCreateEntity, tx: EntityManager): Promise<Identity> {
    return tx.getRepository(Identity).save(data);
  }

  async findAllIdsByAccountId({
    userId,
    customerId,
    tx,
  }: {
    userId?: string;
    customerId?: string;
    tx?: EntityManager;
  }): Promise<string[]> {
    if (!userId && !customerId) return [];
    if (userId && customerId) {
      throw new Error(
        'findAllIdsByAccountId requires exactly one of userId or customerId',
      );
    }
    const repo = tx ? tx.getRepository(Identity) : this.identityRepository;
    const identities = await repo.find({
      where: userId ? { userId } : { customerId },
      select: ['id'],
    });
    return identities.map((i) => i.id);
  }

  async updatePassword({
    userId,
    customerId,
    passwordHash,
    oldPasswordHash,
    tx,
  }: {
    userId?: string;
    customerId?: string;
    passwordHash: string;
    oldPasswordHash?: string;
    tx?: EntityManager;
  }): Promise<boolean> {
    const hasUserId = Boolean(userId);
    const hasCustomerId = Boolean(customerId);

    if (hasUserId === hasCustomerId) {
      throw new Error(
        'updatePassword requires exactly one of userId or customerId',
      );
    }

    const where: Record<string, unknown> = hasUserId
      ? { userId, provider: AuthProvider.LOCAL }
      : { customerId, provider: AuthProvider.LOCAL };

    if (oldPasswordHash !== undefined) {
      where.passwordHash = oldPasswordHash;
    }

    const repo = tx ? tx.getRepository(Identity) : this.identityRepository;
    const result = await repo.update(where, { passwordHash });
    return (result.affected ?? 0) > 0;
  }
}
