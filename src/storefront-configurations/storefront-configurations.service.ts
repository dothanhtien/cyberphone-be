import { DataSource } from 'typeorm';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  GetStorefrontConfigurationsDto,
  StorefrontConfigurationCreateEntityInput,
  StorefrontConfigurationResponseDto,
  StorefrontConfigurationUpdateEntityInput,
  SyncStorefrontConfigurationsDto,
} from './dto';
import {
  StorefrontConfigurationSection,
  StorefrontConfigurationType,
} from './enums';
import { StorefrontConfigurationMapper } from './mappers';
import {
  type IStorefrontConfigurationRepository,
  STOREFRONT_CONFIGURATION_REPOSITORY,
} from './repositories';
import { type StorefrontConfiguration } from './entities';
import { CategoriesService } from '@/categories/categories.service';
import { getErrorStack, sanitizeEntityInput } from '@/common/utils';

@Injectable()
export class StorefrontConfigurationsService {
  private readonly logger = new Logger(StorefrontConfigurationsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly categoriesService: CategoriesService,
    @Inject(STOREFRONT_CONFIGURATION_REPOSITORY)
    private readonly storefrontConfigurationRepository: IStorefrontConfigurationRepository,
  ) {}

  async syncStorefrontConfigurations(
    syncStorefrontConfigurationsDto: SyncStorefrontConfigurationsDto,
    actor: string,
  ): Promise<boolean> {
    const { items } = syncStorefrontConfigurationsDto;

    this.logger.log(
      `[syncStorefrontConfigurations] Syncing ${items.length} storefront configuration items`,
    );

    const activeItems = items.filter((i) => !i.isDeleted);

    const allCategoryIds = [...new Set(activeItems.map((i) => i.categoryId))];
    const existingCategories =
      await this.categoriesService.findActiveByIds(allCategoryIds);
    const existingCategoryIds = new Set(existingCategories.map((c) => c.id));
    const missingIds = allCategoryIds.filter(
      (id) => !existingCategoryIds.has(id),
    );

    if (missingIds.length) {
      throw new NotFoundException(
        `Categories not found: ${missingIds.join(', ')}`,
      );
    }

    const itemsByType = new Map<StorefrontConfigurationSection, typeof items>();

    for (const item of items) {
      if (!itemsByType.has(item.type)) itemsByType.set(item.type, []);
      itemsByType.get(item.type)!.push(item);
    }

    try {
      await this.dataSource.transaction(async (tx) => {
        await Promise.all(
          Array.from(itemsByType.entries()).map(async ([type, typeItems]) => {
            const configurationType = this.mapToConfigurationType(type);

            if (!configurationType) {
              throw new BadRequestException('Configuration type is invalid');
            }

            const existing =
              await this.storefrontConfigurationRepository.findByType(
                configurationType,
              );
            const existingByCategoryId = new Map(
              existing.map((e) => [e.categoryId, e.id]),
            );

            const syncItems = typeItems.filter((i) => !i.isDeleted);
            const inputCategoryIds = new Set(
              syncItems.map((i) => i.categoryId),
            );

            const toInsert = syncItems.filter(
              (i) => !existingByCategoryId.has(i.categoryId),
            );
            const toUpdate = syncItems
              .filter((i) => existingByCategoryId.has(i.categoryId))
              .map((item) => ({
                configId: existingByCategoryId.get(item.categoryId)!,
                item,
              }));
            const toDeleteIds = existing
              .filter((e) => !inputCategoryIds.has(e.categoryId!))
              .map((e) => e.id);

            this.logger.log(
              `[syncStorefrontConfigurations] type=${type} insert=${toInsert.length}, update=${toUpdate.length}, delete=${toDeleteIds.length}`,
            );

            await Promise.all([
              this.storefrontConfigurationRepository.bulkInsert(
                tx,
                toInsert.map((item) =>
                  sanitizeEntityInput(
                    StorefrontConfigurationCreateEntityInput,
                    {
                      categoryId: item.categoryId,
                      title: item.title ?? null,
                      icon: item.icon ?? null,
                      displayOrder: item.displayOrder,
                      isActive: item.enabled,
                      createdBy: actor,
                      type: configurationType,
                    },
                  ),
                ),
              ),
              this.storefrontConfigurationRepository.bulkUpdate(
                tx,
                toUpdate.map(({ configId, item }) => ({
                  configId,
                  data: sanitizeEntityInput(
                    StorefrontConfigurationUpdateEntityInput,
                    {
                      title: item.title ?? null,
                      icon: item.icon ?? null,
                      displayOrder: item.displayOrder,
                      isActive: item.enabled,
                      updatedBy: actor,
                    },
                  ),
                })),
              ),
              this.storefrontConfigurationRepository.bulkDeleteByIds(
                tx,
                toDeleteIds,
              ),
            ]);
          }),
        );
      });
    } catch (error) {
      this.logger.error(
        `[syncConfigurations] Transaction failed`,
        getErrorStack(error),
      );
      throw error;
    }

    return true;
  }

  async getStorefrontConfigurations(
    getConfigurations: GetStorefrontConfigurationsDto,
  ): Promise<
    | StorefrontConfigurationResponseDto[]
    | Record<
        StorefrontConfigurationSection,
        StorefrontConfigurationResponseDto[]
      >
  > {
    if (getConfigurations.type) {
      const configurationType = this.mapToConfigurationType(
        getConfigurations.type,
      );

      if (!configurationType) {
        throw new BadRequestException('Configuration type is invalid');
      }

      const items =
        await this.storefrontConfigurationRepository.findByTypeWithCategory(
          configurationType,
        );

      return items.map((item) =>
        StorefrontConfigurationMapper.mapToStorefrontConfigurationResponse(
          item,
        ),
      );
    }

    const allItems: StorefrontConfiguration[] =
      await this.storefrontConfigurationRepository.findAllWithCategory();

    const grouped: Record<
      StorefrontConfigurationSection,
      StorefrontConfigurationResponseDto[]
    > = {
      [StorefrontConfigurationSection.PRODUCT_SECTIONS]: [],
      [StorefrontConfigurationSection.CATEGORIES_PANEL]: [],
    };

    for (const item of allItems) {
      const section = this.mapToConfigurationSection(item.type);
      if (section) {
        grouped[section].push(
          StorefrontConfigurationMapper.mapToStorefrontConfigurationResponse(
            item,
          ),
        );
      }
    }

    return grouped;
  }

  private mapToConfigurationType(
    type: StorefrontConfigurationSection,
  ): StorefrontConfigurationType | null {
    switch (type) {
      case StorefrontConfigurationSection.PRODUCT_SECTIONS:
        return StorefrontConfigurationType.CATEGORY_PRODUCTS;
      case StorefrontConfigurationSection.CATEGORIES_PANEL:
        return StorefrontConfigurationType.NAV_ITEM;
      default:
        return null;
    }
  }

  private mapToConfigurationSection(
    type: StorefrontConfigurationType,
  ): StorefrontConfigurationSection | null {
    switch (type) {
      case StorefrontConfigurationType.CATEGORY_PRODUCTS:
        return StorefrontConfigurationSection.PRODUCT_SECTIONS;
      case StorefrontConfigurationType.NAV_ITEM:
        return StorefrontConfigurationSection.CATEGORIES_PANEL;
      default:
        return null;
    }
  }
}
