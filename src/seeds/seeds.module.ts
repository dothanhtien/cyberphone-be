import { Module } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { SeedRolesRunner } from './runners/seed-roles.runner';
import { SeedSuperAdminRunner } from './runners/seed-super-admin.runner';

@Module({
  providers: [SeedsService, SeedRolesRunner, SeedSuperAdminRunner],
})
export class SeedsModule {}
