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
  }: {
    userId?: string;
    customerId?: string;
  }): Promise<Identity | null>;
  save(data: IdentityCreateEntity, tx: EntityManager): Promise<Identity>;
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
      relations: ['user', 'customer'],
    });
  }

  findOneByAccountId({
    userId,
    customerId,
  }: {
    userId?: string;
    customerId?: string;
  }): Promise<Identity | null> {
    if (!userId && !customerId) return Promise.resolve(null);

    if (userId && customerId) {
      throw new Error(
        'findOneByAccountId requires exactly one of userId or customerId',
      );
    }

    return this.identityRepository.findOne({
      where: userId ? { userId } : { customerId },
    });
  }

  async save(data: IdentityCreateEntity, tx: EntityManager): Promise<Identity> {
    return tx.getRepository(Identity).save(data);
  }
}
