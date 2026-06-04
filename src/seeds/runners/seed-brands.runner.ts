import { Brand } from '@/brands/entities';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

const BRANDS = [
  {
    name: 'Apple',
    slug: 'apple',
    description: 'American multinational technology company',
    websiteUrl: 'https://www.apple.com',
  },
  {
    name: 'Samsung',
    slug: 'samsung',
    description: 'South Korean multinational electronics corporation',
    websiteUrl: 'https://www.samsung.com',
  },
  {
    name: 'Google',
    slug: 'google',
    description: 'American multinational technology company',
    websiteUrl: 'https://store.google.com',
  },
  {
    name: 'Xiaomi',
    slug: 'xiaomi',
    description: 'Chinese multinational electronics company',
    websiteUrl: 'https://www.mi.com',
  },
  {
    name: 'OnePlus',
    slug: 'oneplus',
    description: 'Chinese smartphone manufacturer',
    websiteUrl: 'https://www.oneplus.com',
  },
];

@Injectable()
export class SeedBrandsRunner {
  private readonly logger = new Logger(SeedBrandsRunner.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const brandRepo = manager.getRepository(Brand);

      for (const data of BRANDS) {
        const existing = await brandRepo.findOne({
          where: { slug: data.slug, isActive: true },
        });

        if (existing) {
          this.logger.log(`Brand already exists: ${data.name}`);
          continue;
        }

        await brandRepo.save(
          brandRepo.create({ ...data, createdBy: 'system' }),
        );
        this.logger.log(`Created brand: ${data.name}`);
      }
    });
  }
}
