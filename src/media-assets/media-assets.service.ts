import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { MediaAsset } from './entities/media-asset.entity';
import { CreateMediaAssetDto } from './dto/create-media-asset.dto';
import { toEntity } from '@/common/utils/entities';

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

  async findByRefId(
    refType: string,
    refId: string,
    entityManager?: EntityManager,
  ) {
    const repository = entityManager
      ? entityManager.getRepository(MediaAsset)
      : this.mediaAssetRepository;

    return repository.findOne({
      where: {
        refType,
        refId,
      },
    });
  }

  async findByRefIds(refType: string, refIds: string[]) {
    return this.mediaAssetRepository.find({
      where: {
        refType,
        refId: In(refIds),
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
