import { EntityManager, In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StorefrontConfiguration } from '../entities';
import { StorefrontConfigurationType } from '../enums';
import {
  StorefrontConfigurationCreateEntityInput,
  StorefrontConfigurationUpdateEntityInput,
} from '../dto';

export interface IStorefrontConfigurationRepository {
  findByType(
    type: StorefrontConfigurationType,
  ): Promise<StorefrontConfiguration[]>;
  findByTypeWithCategory(
    type: StorefrontConfigurationType,
  ): Promise<StorefrontConfiguration[]>;
  findAllWithCategory(): Promise<StorefrontConfiguration[]>;
  bulkInsert(
    tx: EntityManager,
    items: StorefrontConfigurationCreateEntityInput[],
  ): Promise<void>;
  bulkUpdate(
    tx: EntityManager,
    updates: {
      configId: string;
      data: StorefrontConfigurationUpdateEntityInput;
    }[],
  ): Promise<void>;
  bulkDeleteByIds(tx: EntityManager, ids: string[]): Promise<void>;
}

export const STOREFRONT_CONFIGURATION_REPOSITORY = Symbol(
  'IStorefrontConfigurationRepository',
);

@Injectable()
export class StorefrontConfigurationRepository implements IStorefrontConfigurationRepository {
  constructor(
    @InjectRepository(StorefrontConfiguration)
    private readonly repository: Repository<StorefrontConfiguration>,
  ) {}

  findByType(
    type: StorefrontConfigurationType,
  ): Promise<StorefrontConfiguration[]> {
    return this.repository.find({ where: { type } });
  }

  findByTypeWithCategory(
    type: StorefrontConfigurationType,
  ): Promise<StorefrontConfiguration[]> {
    return this.repository.find({
      where: { type },
      relations: { category: { children: true } },
      order: { displayOrder: 'ASC' },
    });
  }

  findAllWithCategory(): Promise<StorefrontConfiguration[]> {
    return this.repository.find({
      relations: { category: { children: true } },
      order: { displayOrder: 'ASC' },
    });
  }

  async bulkInsert(
    tx: EntityManager,
    items: StorefrontConfigurationCreateEntityInput[],
  ): Promise<void> {
    if (!items.length) return;

    await tx
      .createQueryBuilder()
      .insert()
      .into(StorefrontConfiguration)
      .values(
        items.map((item) => ({
          type: item.type,
          categoryId: item.categoryId,
          title: item.title,
          icon: item.icon,
          displayOrder: item.displayOrder,
          isActive: item.isActive,
          createdBy: item.createdBy,
        })),
      )
      .execute();
  }

  async bulkUpdate(
    tx: EntityManager,
    updates: {
      configId: string;
      data: StorefrontConfigurationUpdateEntityInput;
    }[],
  ): Promise<void> {
    if (!updates.length) return;

    await Promise.all(
      updates.map((u) =>
        tx.update(StorefrontConfiguration, u.configId, u.data),
      ),
    );
  }

  async bulkDeleteByIds(tx: EntityManager, ids: string[]): Promise<void> {
    if (!ids.length) return;
    await tx.delete(StorefrontConfiguration, { id: In(ids) });
  }
}
