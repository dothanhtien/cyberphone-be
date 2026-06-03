import { Category } from '@/categories/entities';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface CategorySeed {
  name: string;
  slug: string;
  description: string | null;
  parentSlug: string | null;
}

const CATEGORIES: CategorySeed[] = [
  {
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Mobile phones and smartphones',
    parentSlug: null,
  },
  {
    name: 'iOS',
    slug: 'ios',
    description: 'Apple iPhone devices',
    parentSlug: 'smartphones',
  },
  {
    name: 'Android',
    slug: 'android',
    description: 'Android-powered smartphones',
    parentSlug: 'smartphones',
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    description: 'Laptop computers and notebooks',
    parentSlug: null,
  },
  {
    name: 'Tablets',
    slug: 'tablets',
    description: 'Tablet computers and iPads',
    parentSlug: null,
  },
  {
    name: 'Smart Watches',
    slug: 'smart-watches',
    description: 'Smartwatches and fitness trackers',
    parentSlug: null,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Phone accessories and peripherals',
    parentSlug: null,
  },
  {
    name: 'Cases & Covers',
    slug: 'cases-covers',
    description: 'Protective cases and covers',
    parentSlug: 'accessories',
  },
  {
    name: 'Chargers',
    slug: 'chargers',
    description: 'Chargers and power adapters',
    parentSlug: 'accessories',
  },
];

@Injectable()
export class SeedCategoriesRunner {
  private readonly logger = new Logger(SeedCategoriesRunner.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const categoryRepo = manager.getRepository(Category);
      const slugToId = new Map<string, string>();

      // Seed parents first, then children
      const sorted = [
        ...CATEGORIES.filter((c) => !c.parentSlug),
        ...CATEGORIES.filter((c) => c.parentSlug),
      ];

      for (const data of sorted) {
        const existing = await categoryRepo.findOne({
          where: { slug: data.slug, isActive: true },
        });

        if (existing) {
          this.logger.log(`Category already exists: ${data.name}`);
          slugToId.set(data.slug, existing.id);
          continue;
        }

        if (data.parentSlug && !slugToId.has(data.parentSlug)) {
          throw new Error(
            `Parent slug "${data.parentSlug}" not found for category "${data.slug}"`,
          );
        }
        const parentId = data.parentSlug
          ? (slugToId.get(data.parentSlug) ?? null)
          : null;

        const saved = await categoryRepo.save(
          categoryRepo.create({
            name: data.name,
            slug: data.slug,
            description: data.description,
            parentId,
            createdBy: 'system',
          }),
        );

        slugToId.set(data.slug, saved.id);
        this.logger.log(`Created category: ${data.name}`);
      }
    });
  }
}
