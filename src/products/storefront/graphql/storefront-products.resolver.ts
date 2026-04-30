import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { ProductSortEnum } from '../enums';
import { StorefrontProductsService } from '../storefront-products.service';
import { StorefrontProductType } from './storefront-product.type';
import { Public } from '@/auth/decorators';

@Public()
@Resolver(() => StorefrontProductType)
export class StorefrontProductsResolver {
  constructor(private readonly productsService: StorefrontProductsService) {}

  @Query(() => [StorefrontProductType], {
    description: 'Latest products sorted by creation date',
  })
  async newProducts(
    @Args('limit', { type: () => Int, defaultValue: 8 }) limit: number,
  ): Promise<StorefrontProductType[]> {
    const { items } = await this.productsService.findAll({
      limit,
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
    const { items } = await this.productsService.findAll({
      limit,
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
    const { items } = await this.productsService.findAll({
      limit,
      categorySlug,
    });
    return items;
  }
}
