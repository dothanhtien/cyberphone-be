import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { SliderCreateEntityInput, SliderUpdateEntityInput } from '../admin/dto';
import { StorefrontSlider } from '../entities';
import { SliderWithExtras } from '../types';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';

export interface IStorefrontSliderRepository {
  findByIds(ids: string[]): Promise<StorefrontSlider[]>;
  bulkInsert(
    tx: EntityManager,
    data: SliderCreateEntityInput[],
  ): Promise<StorefrontSlider[]>;
  bulkUpdate(
    tx: EntityManager,
    updates: { id: string; data: SliderUpdateEntityInput }[],
  ): Promise<void>;
  bulkDeactivate(
    tx: EntityManager,
    ids: string[],
    updatedBy: string,
  ): Promise<void>;
  bulkHardDelete(tx: EntityManager, ids: string[]): Promise<void>;
  findAll(): Promise<SliderWithExtras[]>;
}

export const STOREFRONT_SLIDER_REPOSITORY = Symbol(
  'IStorefrontSliderRepository',
);

@Injectable()
export class StorefrontSliderRepository implements IStorefrontSliderRepository {
  constructor(
    @InjectRepository(StorefrontSlider)
    private readonly repository: Repository<StorefrontSlider>,
  ) {}

  findByIds(ids: string[]): Promise<StorefrontSlider[]> {
    if (!ids.length) return Promise.resolve([]);
    return this.repository.find({ where: { id: In(ids) } });
  }

  async bulkInsert(
    tx: EntityManager,
    data: SliderCreateEntityInput[],
  ): Promise<StorefrontSlider[]> {
    if (!data.length) return [];

    const result = await tx
      .createQueryBuilder()
      .insert()
      .into(StorefrontSlider)
      .values(data)
      .returning('*')
      .execute();

    return result.generatedMaps as StorefrontSlider[];
  }

  async bulkUpdate(
    tx: EntityManager,
    updates: { id: string; data: SliderUpdateEntityInput }[],
  ): Promise<void> {
    if (!updates.length) return;
    await Promise.all(
      updates.map((u) => tx.update(StorefrontSlider, u.id, u.data)),
    );
  }

  async bulkDeactivate(
    tx: EntityManager,
    ids: string[],
    updatedBy: string,
  ): Promise<void> {
    if (!ids.length) return;
    await tx.update(StorefrontSlider, ids, { isActive: false, updatedBy });
  }

  async bulkHardDelete(tx: EntityManager, ids: string[]): Promise<void> {
    if (!ids.length) return;
    await tx.delete(StorefrontSlider, ids);
  }

  findAll(): Promise<SliderWithExtras[]> {
    return this.repository
      .createQueryBuilder('s')
      .leftJoin(
        'media_assets',
        'm',
        `
          m.ref_type = :refType 
          AND m.ref_id::uuid = s.id 
          AND m.is_active = true 
          AND m.usage_type = :usageType
        `,
        {
          refType: MediaAssetRefType.SLIDER,
          usageType: MediaAssetUsageType.MAIN,
        },
      )
      .select([
        's.id AS id',
        's.title AS title',
        's.display_order AS "displayOrder"',
        's.is_active AS "isActive"',
        's.created_at AS "createdAt"',
        's.created_by AS "createdBy"',
        's.updated_at AS "updatedAt"',
        's.updated_by AS "updatedBy"',
      ])
      .addSelect('m.url', 'url')
      .orderBy('s.display_order', 'ASC')
      .addOrderBy('COALESCE(s.updated_at, s.created_at)', 'DESC')
      .getRawMany<SliderWithExtras>();
  }
}
