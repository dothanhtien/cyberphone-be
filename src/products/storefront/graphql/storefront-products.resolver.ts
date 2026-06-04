import { BadRequestException } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { ProductSortEnum } from '../enums';
import { StorefrontProductsService } from '../storefront-products.service';
import { StorefrontProductType } from './storefront-product.type';
import { Public } from '@/auth/decorators';

@Public()
@Resolver(() => StorefrontProductType)
export class StorefrontProductsResolver {
  constructor(private readonly productsService: StorefrontProductsService) {}

  private normalizeLimit(limit: number): number {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('limit must be between 1 and 100');
    }

    return limit;
  }

  @Query(() => [StorefrontProductType], {
    description: 'Latest products sorted by creation date',
  })
  async newProducts(
    @Args('limit', { type: () => Int, defaultValue: 8 }) limit: number,
  ): Promise<StorefrontProductType[]> {
    const normalizedLimit = this.normalizeLimit(limit);

    const { items } = await this.productsService.findAll({
      limit: normalizedLimit,
      sort: ProductSortEnum.NEWEST,
    });
    return items;
  }

  @Query(() => [StorefrontProductType], {
    description: 'Products marked as featured',
  })
  async featuredProducts(
    @Args('limit', { type: () => Int, defaultValue: 8 }) limit: number,
  ): Promise<StorefrontProductType[]> {
    const normalizedLimit = this.normalizeLimit(limit);

    const { items } = await this.productsService.findAll({
      limit: normalizedLimit,
      isFeatured: true,
    });
    return items;
  }

  @Query(() => [StorefrontProductType], {
    description: 'Products belonging to a category',
  })
  async categoryProducts(
    @Args('categorySlug') categorySlug: string,
    @Args('limit', { type: () => Int, defaultValue: 8 }) limit: number,
  ): Promise<StorefrontProductType[]> {
    const normalizedLimit = this.normalizeLimit(limit);

    const normalizedSlug = categorySlug.trim();
    if (!normalizedSlug) {
      throw new BadRequestException('categorySlug must not be empty');
    }

    const { items } = await this.productsService.findAll({
      limit: normalizedLimit,
      categorySlug,
    });
    return items;
  }
}
