import { Role } from '@/users/entities/role.entity';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SeedRolesRunner {
  private readonly logger = new Logger(SeedRolesRunner.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const rolesToSeed = [
      {
        name: 'SUPER_ADMIN',
        description: 'System super administrator',
        createdBy: 'system',
        isSystem: true,
      },
      {
        name: 'ADMIN',
        description: 'System administrator',
        createdBy: 'system',
      },
      {
        name: 'STAFF',
        description: 'Internal staff',
        createdBy: 'system',
      },
      {
        name: 'CUSTOMER',
        description: 'Customer account',
        createdBy: 'system',
      },
    ];

    await this.dataSource.transaction(async (manager) => {
      const roleRepo = manager.getRepository(Role);

      for (const roleData of rolesToSeed) {
        const activeRole = await roleRepo.findOne({
          where: { name: roleData.name, isActive: true },
        });

        if (activeRole) {
          this.logger.log(`Role already exists: ${roleData.name}`);
          continue;
        }

        const inactiveRole = await roleRepo.findOne({
          where: { name: roleData.name, isActive: false },
        });

        if (inactiveRole) {
          await roleRepo.save({
            ...inactiveRole,
            isActive: true,
            updatedBy: 'system',
          });
          this.logger.log(`Reactivated role: ${roleData.name}`);
        } else {
          await roleRepo.save(roleRepo.create(roleData));
          this.logger.log(`Created role: ${roleData.name}`);
        }
      }
    });
  }
}
