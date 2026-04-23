import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateMediaAssetDto, MediaAssetCreateEntityDto } from './dto';
import {
  type IMediaAssetRepository,
  MEDIA_ASSET_REPOSITORY,
} from './repositories';
import { MediaAssetRefType, MediaAssetUsageType } from '@/common/enums';
import { sanitizeEntityInput } from '@/common/utils';

@Injectable()
export class MediaAssetsService {
  constructor(
    @Inject(MEDIA_ASSET_REPOSITORY)
    private readonly mediaAssetRepository: IMediaAssetRepository,
  ) {}

  create(createMediaAssetDtos: CreateMediaAssetDto[], tx?: EntityManager) {
    const entities = createMediaAssetDtos.map((dto) =>
      sanitizeEntityInput(MediaAssetCreateEntityDto, dto),
    );
    return this.mediaAssetRepository.create(entities, tx);
  }

  findByRefId({
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
    return this.mediaAssetRepository.findByRefId(refType, refId, usageType, tx);
  }

  findByRefIds(
    refType: MediaAssetRefType,
    refIds: string[],
    usageType: MediaAssetUsageType,
  ) {
    return this.mediaAssetRepository.findByRefIds(refType, refIds, usageType);
  }

  deleteById(id: string, entityManager?: EntityManager) {
    return this.mediaAssetRepository.deleteById(id, entityManager);
  }
}
