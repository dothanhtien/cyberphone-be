import { Module } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { SeedRolesRunner } from './runners/seed-roles.runner';
import { SeedSuperAdminRunner } from './runners/seed-super-admin.runner';
import { SeedBrandsRunner } from './runners/seed-brands.runner';
import { SeedCategoriesRunner } from './runners/seed-categories.runner';
import { SeedProductsRunner } from './runners/seed-products.runner';

@Module({
  providers: [
    SeedsService,
    SeedRolesRunner,
    SeedSuperAdminRunner,
    SeedBrandsRunner,
    SeedCategoriesRunner,
    SeedProductsRunner,
  ],
})
export class SeedsModule {}
