import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Product } from '@/products/entities/product.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductAssetsService } from '@/product-assets/product-assets.service';
import { ProductAsset } from '@/product-assets/entities/product-assets.entity';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productAssetsService: ProductAssetsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    createProductVariantDto.slug = createProductVariantDto.slug.toLowerCase();
    createProductVariantDto.sku = createProductVariantDto.sku.toLowerCase();

    const productExists = await this.productRepository.existsBy({
      id: createProductVariantDto.productId,
      isActive: true,
    });

    if (!productExists) {
      throw new BadRequestException(`Product not found`);
    }

    const productVariantExists = await this.productVariantRepository.exists({
      where: [
        { slug: createProductVariantDto.slug, isActive: true },
        { sku: createProductVariantDto.sku, isActive: true },
      ],
    });

    if (productVariantExists) {
      throw new BadRequestException('Slug or SKU already exists');
    }

    return this.dataSource.transaction(async (tx) => {
      const newVariant = plainToInstance(
        ProductVariant,
        createProductVariantDto,
        {
          excludeExtraneousValues: true,
        },
      );

      const savedVariant = await tx.save(ProductVariant, newVariant);

      let { assetItems } = createProductVariantDto;
      let savedAssets: ProductAsset[] = [];

      if (assetItems.length > 0) {
        assetItems = assetItems.map((asset) => ({
          ...asset,
          variantId: savedVariant.id,
        }));
        savedAssets = await this.productAssetsService.createMany(
          assetItems,
          tx,
        );
      }

      return { ...savedVariant, assets: savedAssets };
    });
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    const variant = await this.productVariantRepository.findOne({
      where: { id, isActive: true },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (updateProductVariantDto.sku) {
      updateProductVariantDto.sku = updateProductVariantDto.sku.toLowerCase();
    }

    if (updateProductVariantDto.slug) {
      updateProductVariantDto.slug = updateProductVariantDto.slug.toLowerCase();
    }

    if (
      updateProductVariantDto.productId &&
      updateProductVariantDto.productId !== variant.productId
    ) {
      const productExists = await this.productRepository.existsBy({
        id: updateProductVariantDto.productId,
        isActive: true,
      });

      if (!productExists) {
        throw new NotFoundException('Product not found');
      }
    }

    if (
      updateProductVariantDto.sku &&
      updateProductVariantDto.sku !== variant.sku
    ) {
      const variantExists = await this.productVariantRepository.existsBy({
        sku: updateProductVariantDto.sku,
        isActive: true,
      });

      if (variantExists) {
        throw new BadRequestException('SKU already exists');
      }
    }

    if (
      updateProductVariantDto.slug &&
      updateProductVariantDto.slug !== variant.slug
    ) {
      const variantExists = await this.productVariantRepository.existsBy({
        slug: updateProductVariantDto.slug,
        isActive: true,
      });

      if (variantExists) {
        throw new BadRequestException('Slug already exists');
      }
    }

    const variantToUpdate = plainToInstance(
      ProductVariant,
      {
        ...variant,
        ...updateProductVariantDto,
      },
      { excludeExtraneousValues: true },
    );

    return this.productVariantRepository.save(variantToUpdate);
  }

  async remove(id: string, data: { updatedBy: string }) {
    const existing = await this.productVariantRepository.existsBy({
      id,
      isActive: true,
    });

    if (!existing) {
      throw new NotFoundException('Product variant not found');
    }

    const result = await this.productVariantRepository.update(id, {
      isActive: false,
      updatedBy: data.updatedBy,
    });

    return result.affected === 1;
  }
}
