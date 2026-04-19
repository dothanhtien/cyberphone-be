import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import {
  VariantAttributeCreateEntityDto,
  VariantAttributeUpdateEntityDto,
} from '../admin/dto';
import { VariantAttribute } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';

export interface IVariantAttributeRepository {
  create(
    data: VariantAttributeCreateEntityDto,
    tx?: EntityManager,
  ): Promise<void>;
  findAllActiveByVariantId(
    variantId: string,
    tx?: EntityManager,
  ): Promise<VariantAttribute[]>;
  update(
    id: string,
    data: VariantAttributeUpdateEntityDto,
    tx?: EntityManager,
  ): Promise<void>;
}

export const VARIANT_ATTRIBUTE_REPOSITORY = Symbol(
  'IVariantAttributeRepository',
);

@Injectable()
export class VariantAttributeRepository implements IVariantAttributeRepository {
  constructor(
    @InjectRepository(VariantAttribute)
    private readonly repository: Repository<VariantAttribute>,
  ) {}

  async create(
    data: VariantAttributeCreateEntityDto,
    tx?: EntityManager,
  ): Promise<void> {
    const repo = tx ? tx.getRepository(VariantAttribute) : this.repository;

    await repo.save(data);
  }

  findAllActiveByVariantId(
    variantId: string,
    tx?: EntityManager,
  ): Promise<VariantAttribute[]> {
    const repo = tx ? tx.getRepository(VariantAttribute) : this.repository;

    return repo.find({ where: { variantId, isActive: true } });
  }

  async update(
    id: string,
    data: VariantAttributeUpdateEntityDto,
    tx?: EntityManager,
  ): Promise<void> {
    const repo = tx ? tx.getRepository(VariantAttribute) : this.repository;

    await repo.update(id, data);
  }
}
