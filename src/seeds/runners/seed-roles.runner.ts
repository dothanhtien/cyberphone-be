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
        const exists = await roleRepo.findOne({
          where: { name: roleData.name },
        });

        if (!exists) {
          await roleRepo.save(roleRepo.create(roleData));
          this.logger.log(`Created role: ${roleData.name}`);
        } else {
          this.logger.log(`Role already exists: ${roleData.name}`);
        }
      }
    });
  }
}
