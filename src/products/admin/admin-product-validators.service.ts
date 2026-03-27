import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductImageDto, UpdateProductDto } from './dto';
import { Product } from '../entities';
import { PRODUCT_REPOSITORY, type IProductRepository } from './repositories';
import { BrandsService } from '@/brands/brands.service';
import { CategoriesService } from '@/categories/categories.service';
import { getFilename } from '@/common/utils';

@Injectable()
export class AdminProductValidatorsService {
  private readonly logger = new Logger(AdminProductValidatorsService.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async ensureBrandExists(brandId: string): Promise<void> {
    const exists = await this.brandsService.exists(brandId);

    if (!exists) {
      this.logger.warn(
        `[ensureBrandExists] Brand not found brandId=${brandId}`,
      );
      throw new NotFoundException('Brand not found');
    }
  }

  async ensureSlugNotTaken(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.productRepository.existsActiveBySlugExcludingId(
      slug,
      excludeId,
    );

    if (existing) {
      this.logger.warn(
        `[ensureSlugNotTaken] Slug already taken slug=${slug}${
          excludeId ? `, excludeId=${excludeId}` : ''
        }`,
      );
      throw new ConflictException('Slug already exists');
    }
  }

  async ensureCategoriesExistAndActive(categoryIds: string[]): Promise<void> {
    if (!categoryIds.length) {
      this.logger.debug(
        `[ensureCategoriesExistAndActive] No categories provided`,
      );
      return;
    }

    const uniqueCategoryIds = [...new Set(categoryIds)];
    if (uniqueCategoryIds.length !== categoryIds.length) {
      this.logger.debug(
        `[ensureCategoriesExistAndActive] categoryIds must be unique uniuniqueCategoryIds=${uniqueCategoryIds.length}, categoryIds=${categoryIds.length}`,
      );

      throw new BadRequestException('categoryIds must be unique');
    }

    const found =
      await this.categoriesService.findActiveByIds(uniqueCategoryIds);

    if (found.length !== uniqueCategoryIds.length) {
      const foundIds = new Set(found.map((c) => c.id));
      const invalidIds = uniqueCategoryIds.filter((id) => !foundIds.has(id));

      this.logger.warn(
        `[ensureCategoriesExistAndActive] Invalid or inactive categories ids=[${invalidIds.join(', ')}]`,
      );

      throw new BadRequestException(
        'One or more categories are invalid or inactive',
      );
    }
  }

  validateImagesMetadata({
    imageMetas,
    images,
  }: {
    imageMetas: CreateProductImageDto[];
    images: Express.Multer.File[];
  }): void {
    if (!images.length) {
      this.logger.debug(`[validateImagesMetadata] No images uploaded`);
      return;
    }

    if (!imageMetas.length) {
      this.logger.warn(`[validateImagesMetadata] No imageMetas provided`);

      throw new BadRequestException(
        'imageMetas is required when uploading images',
      );
    }

    const imageIds = images.map((file) => getFilename(file.originalname));
    if (new Set(imageIds).size !== imageIds.length) {
      throw new BadRequestException(
        'Uploaded image filenames must be unique after removing the extension',
      );
    }

    const metaIds = imageMetas.map((m) => m.id);
    if (new Set(metaIds).size !== metaIds.length) {
      throw new BadRequestException('imageMetas ids must be unique');
    }

    const metaIdSet = new Set(metaIds);

    const missingMeta = images.find(
      (file) => !metaIdSet.has(getFilename(file.originalname)),
    );

    if (missingMeta) {
      this.logger.warn(
        `[validateImagesMetadata] Missing metadata — file=${missingMeta.originalname}`,
      );

      throw new BadRequestException(
        `Missing meta for image: ${missingMeta.originalname}`,
      );
    }
  }

  async validateUpdateConstraints(
    updateProductDto: UpdateProductDto,
    product: Product,
    images: Express.Multer.File[],
  ): Promise<void> {
    this.logger.debug(
      `[validateUpdateConstraints] Validating update constraints productId=${product.id}`,
    );

    if (updateProductDto.brandId) {
      await this.ensureBrandExists(updateProductDto.brandId);
    }

    if (updateProductDto.categoryIds?.length) {
      await this.ensureCategoriesExistAndActive(updateProductDto.categoryIds);
    }

    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      await this.ensureSlugNotTaken(updateProductDto.slug, product.id);
    }

    if (images.length > 0) {
      this.validateImagesMetadata({
        imageMetas: updateProductDto.imageMetas ?? [],
        images,
      });
    }

    this.logger.debug(
      `[validateUpdateConstraints] Done — productId=${product.id}`,
    );
  }
}
