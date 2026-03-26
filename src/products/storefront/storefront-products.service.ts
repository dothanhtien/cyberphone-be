import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FilterProductsDto } from './dto';
import { mapToStorefrontProductResponse } from './mappers';
import {
  type IStorefrontProductRepository,
  STOREFRONT_PRODUCT_REPOSITORY,
} from './repositories';
import { extractPaginationParams } from '@/common/utils';

@Injectable()
export class StorefrontProductsService {
  private readonly logger = new Logger(StorefrontProductsService.name);

  constructor(
    @Inject(STOREFRONT_PRODUCT_REPOSITORY)
    private readonly repo: IStorefrontProductRepository,
  ) {}

  async findAll(params: FilterProductsDto) {
    const { page, limit } = extractPaginationParams(params);

    this.logger.debug(
      `[findAll] Fetching products page=${page}, limit=${limit}`,
    );

    const { items, total } = await this.repo.findAll(params);

    this.logger.log(
      `[findAll] Fetched products page=${page}, count=${items.length}, total=${total}`,
    );

    return {
      items: items.map(mapToStorefrontProductResponse),
      totalCount: total,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(slug: string) {
    this.logger.debug(`[findOne] Fetching product slug=${slug}`);

    const result = await this.repo.findOne(slug);

    if (!result) {
      this.logger.warn(`[findOne] Product not found slug=${slug}`);
      throw new NotFoundException('Product not found');
    }

    this.logger.log(`[findOne] Product fetched successfully slug=${slug}`);

    return result;
  }
}
