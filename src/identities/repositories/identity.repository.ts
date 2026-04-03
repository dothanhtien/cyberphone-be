import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IdentityCreateEntity } from '../dto';
import { AuthProvider, IdentityType } from '../enums';
import { Identity } from '../entities';

export interface IIdentityRepository {
  create(
    data: IdentityCreateEntity,
    tx: EntityManager,
  ): Promise<{ id: string }>;
  existsByValue({
    value,
    provider,
    tx,
  }: {
    value: string;
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
}

export const IDENTITY_REPOSITORY = Symbol('IIdentityRepository');

@Injectable()
export class IdentityRepository implements IIdentityRepository {
  constructor(
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
  ) {}

  async create(
    data: IdentityCreateEntity,
    tx: EntityManager,
  ): Promise<{ id: string }> {
    const repository = tx.getRepository(Identity);

    const result = await repository.save(data);

    return { id: result.id };
  }

  existsByValue({
    value,
    provider,
    tx,
  }: {
    value: string;
    provider: AuthProvider;
    tx: EntityManager;
  }): Promise<boolean> {
    return tx.getRepository(Identity).exists({
      where: { value, provider },
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
}
