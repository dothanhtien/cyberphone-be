import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { MediaAsset } from './entities';
import { CreateMediaAssetDto } from './dto';
import { toEntity } from '@/common/utils';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';

@Injectable()
export class MediaAssetsService {
  constructor(
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
  ) {}

  create(
    createMediaAssetDto: CreateMediaAssetDto,
    entityManager?: EntityManager,
  ) {
    const repository = entityManager
      ? entityManager.getRepository(MediaAsset)
      : this.mediaAssetRepository;

    const mediaAsset = toEntity(MediaAsset, createMediaAssetDto);
    return repository.save(mediaAsset);
  }

  async findByRefId({
    refType,
    refId,
    usageType,
    tx,
  }: {
    refType: MediaAssetRefType;
    refId: string;
    usageType: MediaAssetUsageType;
    tx?: EntityManager;
  }) {
    const repository = tx
      ? tx.getRepository(MediaAsset)
      : this.mediaAssetRepository;

    return repository.findOne({
      where: {
        refType,
        refId,
        usageType,
      },
    });
  }

  async findByRefIds(
    refType: MediaAssetRefType,
    refIds: string[],
    usageType: MediaAssetUsageType,
  ) {
    return this.mediaAssetRepository.find({
      where: {
        refType,
        refId: In(refIds),
        usageType,
      },
    });
  }

  async deleteById(id: string, entityManager?: EntityManager) {
    const repository = entityManager
      ? entityManager.getRepository(MediaAsset)
      : this.mediaAssetRepository;

    return repository.delete(id);
  }
}
