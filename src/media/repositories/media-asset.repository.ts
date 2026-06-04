import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';
import { MediaAssetCreateEntityDto } from '../dto';
import { MediaAsset } from '../entities';

export interface IMediaAssetRepository {
  create(
    data: MediaAssetCreateEntityDto[],
    tx?: EntityManager,
  ): Promise<MediaAsset[]>;
  findByRefId(
    refType: MediaAssetRefType,
    refId: string,
    usageType: MediaAssetUsageType,
    tx?: EntityManager,
  ): Promise<MediaAsset | null>;
  findByRefIds(
    refType: MediaAssetRefType,
    refIds: string[],
    usageType: MediaAssetUsageType,
  ): Promise<MediaAsset[]>;
  findActiveDescriptionsByRefId(
    refType: MediaAssetRefType,
    refId: string,
  ): Promise<MediaAsset[]>;
  findActiveById(id: string): Promise<MediaAsset | null>;
  softDelete(id: string, updatedBy: string): Promise<void>;
  deleteById(id: string, tx?: EntityManager): Promise<void>;
  findOrphanMediasBatch(limit: number): Promise<MediaAsset[]>;
  removeMany(medias: MediaAsset[]): Promise<void>;
}

export const MEDIA_ASSET_REPOSITORY = Symbol('IMediaAssetRepository');

@Injectable()
export class MediaAssetRepository implements IMediaAssetRepository {
  constructor(
    @InjectRepository(MediaAsset)
    private readonly repository: Repository<MediaAsset>,
  ) {}

  create(
    data: MediaAssetCreateEntityDto[],
    tx?: EntityManager,
  ): Promise<MediaAsset[]> {
    const repo = tx ? tx.getRepository(MediaAsset) : this.repository;
    return repo.save(data);
  }

  findByRefId(
    refType: MediaAssetRefType,
    refId: string,
    usageType: MediaAssetUsageType,
    tx?: EntityManager,
  ): Promise<MediaAsset | null> {
    const repo = tx ? tx.getRepository(MediaAsset) : this.repository;
    return repo.findOne({
      where: { refType, refId, usageType, isActive: true },
    });
  }

  findByRefIds(
    refType: MediaAssetRefType,
    refIds: string[],
    usageType: MediaAssetUsageType,
  ): Promise<MediaAsset[]> {
    return this.repository.find({
      where: { refType, refId: In(refIds), usageType, isActive: true },
    });
  }

  findActiveDescriptionsByRefId(
    refType: MediaAssetRefType,
    refId: string,
  ): Promise<MediaAsset[]> {
    return this.repository.find({
      where: {
        refType,
        refId,
        usageType: MediaAssetUsageType.DESCRIPTION,
        isActive: true,
      },
      select: ['id', 'url', 'refType', 'refId', 'usageType', 'metadata'],
      order: {
        updatedAt: { direction: 'DESC', nulls: 'LAST' },
        createdAt: 'DESC',
      },
    });
  }

  findActiveById(id: string): Promise<MediaAsset | null> {
    return this.repository.findOne({ where: { id, isActive: true } });
  }

  async softDelete(id: string, updatedBy: string): Promise<void> {
    await this.repository.save({ id, isActive: false, updatedBy });
  }

  async deleteById(id: string, tx?: EntityManager): Promise<void> {
    const repo = tx ? tx.getRepository(MediaAsset) : this.repository;
    await repo.delete(id);
  }

  findOrphanMediasBatch(limit: number): Promise<MediaAsset[]> {
    return this.repository
      .createQueryBuilder('m')
      .where('m.is_active = true')
      .andWhere(
        `
          (
            (m.ref_type = :brandType AND NOT EXISTS (
              SELECT 1 FROM brands b WHERE b.id = m.ref_id::uuid AND b.is_active = true
            ))
            OR
            (m.ref_type = :categoryType AND NOT EXISTS (
              SELECT 1 FROM categories c WHERE c.id = m.ref_id::uuid AND c.is_active = true
            ))
            OR
            (m.ref_type = :productType AND NOT EXISTS (
              SELECT 1 FROM product_images pi WHERE pi.id = m.ref_id::uuid AND pi.is_active = true
            ))
          )
        `,
        {
          brandType: MediaAssetRefType.BRAND,
          categoryType: MediaAssetRefType.CATEGORY,
          productType: MediaAssetRefType.PRODUCT,
        },
      )
      .take(limit)
      .getMany();
  }

  async removeMany(medias: MediaAsset[]): Promise<void> {
    await this.repository.remove(medias);
  }
}
