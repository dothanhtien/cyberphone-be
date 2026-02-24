import { Injectable } from '@nestjs/common';
import { SeedRolesRunner } from './runners/seed-roles.runner';
import { SeedSuperAdminRunner } from './runners/seed-super-admin.runner';

@Injectable()
export class SeedsService {
  constructor(
    private readonly seedRoles: SeedRolesRunner,
    private readonly seedSuperAdmin: SeedSuperAdminRunner,
  ) {}

  async run() {
    await this.seedRoles.run();
    await this.seedSuperAdmin.run();
  }
}
