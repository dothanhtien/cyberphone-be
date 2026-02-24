import { PasswordService } from '@/password/password.service';
import { Role } from '@/users/entities/role.entity';
import { User } from '@/users/entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SeedSuperAdminRunner {
  private readonly logger = new Logger(SeedSuperAdminRunner.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly passwordService: PasswordService,
  ) {}

  async run(): Promise<void> {
    const username = process.env.SUPER_ADMIN_USERNAME;
    const phone = process.env.SUPER_ADMIN_PHONE;
    const fullName = process.env.SUPER_ADMIN_FULL_NAME;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!username || !phone || !password || !fullName) {
      this.logger.warn(
        'SUPER_ADMIN_USERNAME or SUPER_ADMIN_PASSWORD or SUPER_ADMIN_PHONE or SUPER_ADMIN_FULL_NAME not provided. Skipping super admin seed.',
      );
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const roleRepo = manager.getRepository(Role);

      const existingUser = await userRepo.findOne({
        where: [
          { username, isActive: true },
          { phone, isActive: true },
        ],
        relations: ['role'],
      });

      if (existingUser) {
        this.logger.log(`Super admin already exists: ${username}`);
        return;
      }

      const superAdminRole = await roleRepo.findOne({
        where: { name: 'SUPER_ADMIN', isActive: true },
      });

      if (!superAdminRole) {
        throw new Error('SUPER_ADMIN role not found. Run role seeder first.');
      }

      const hashedPassword = await this.passwordService.hashPassword(password);

      const user = userRepo.create({
        username,
        passwordHash: hashedPassword,
        phone,
        fullName,
        isActive: true,
        createdBy: 'system',
        roleId: superAdminRole.id,
      });

      await userRepo.save(user);

      this.logger.log(`Super admin created: ${username}`);
    });
  }
}
