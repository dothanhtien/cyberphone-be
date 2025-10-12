import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ProductAsset } from './entities/product-assets.entity';
import { CreateProductAssetDto } from './dto/create-product-asset.dto';

@Injectable()
export class ProductAssetsService {
  constructor(
    @InjectRepository(ProductAsset)
    private readonly productAssetRepository: Repository<ProductAsset>,
  ) {}

  async createMany(
    createManyProductAssetsDto: CreateProductAssetDto[],
    manager?: EntityManager,
  ) {
    const newAssets = createManyProductAssetsDto.map((asset) =>
      plainToInstance(ProductAsset, asset, { excludeExtraneousValues: true }),
    );

    const repository = manager
      ? manager.getRepository(ProductAsset)
      : this.productAssetRepository;

    const savedAssets = await repository.save(newAssets);

    return savedAssets;
  }
}
