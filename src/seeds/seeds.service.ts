import { Injectable } from '@nestjs/common';
import { SeedRolesRunner } from './runners/seed-roles.runner';
import { SeedSuperAdminRunner } from './runners/seed-super-admin.runner';
import { SeedBrandsRunner } from './runners/seed-brands.runner';
import { SeedCategoriesRunner } from './runners/seed-categories.runner';
import { SeedProductsRunner } from './runners/seed-products.runner';

@Injectable()
export class SeedsService {
  constructor(
    private readonly seedRoles: SeedRolesRunner,
    private readonly seedSuperAdmin: SeedSuperAdminRunner,
    private readonly seedBrands: SeedBrandsRunner,
    private readonly seedCategories: SeedCategoriesRunner,
    private readonly seedProducts: SeedProductsRunner,
  ) {}

  async run() {
    await this.seedRoles.run();
    await this.seedSuperAdmin.run();
    await this.seedBrands.run();
    await this.seedCategories.run();
    await this.seedProducts.run();
  }
}
