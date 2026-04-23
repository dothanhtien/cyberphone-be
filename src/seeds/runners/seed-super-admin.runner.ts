import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Identity } from '@/identities/entities';
import { AuthProvider, IdentityType } from '@/identities/enums';
import { hashPassword } from '@/common/utils';
import { Role, User } from '@/users/entities';

@Injectable()
export class SeedSuperAdminRunner {
  private readonly logger = new Logger(SeedSuperAdminRunner.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const phone = process.env.SUPER_ADMIN_PHONE;
    const email = process.env.SUPER_ADMIN_EMAIL;
    const firstName = process.env.SUPER_ADMIN_FIRST_NAME;
    const lastName = process.env.SUPER_ADMIN_LAST_NAME;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!phone || !password || !firstName || !lastName) {
      this.logger.warn(
        'Missing required env vars: SUPER_ADMIN_PHONE, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_FIRST_NAME, SUPER_ADMIN_LAST_NAME. Skipping super admin seed.',
      );
      return;
    }

    await this.dataSource.transaction(async (tx) => {
      const userRepository = tx.getRepository(User);
      const roleRepository = tx.getRepository(Role);
      const identityRepository = tx.getRepository(Identity);

      const whereConditions: Array<{
        phone?: string;
        email?: string;
        isActive: boolean;
      }> = [{ phone, isActive: true }];
      if (email) {
        whereConditions.push({ email, isActive: true });
      }

      const existingUser = await userRepository.findOne({
        where: whereConditions,
        relations: ['role'],
      });

      if (existingUser) {
        if (existingUser.role?.name !== 'SUPER_ADMIN') {
          throw new Error(
            `User ${phone} exists but is not SUPER_ADMIN. Resolve manually.`,
          );
        }
        this.logger.log(`Super admin already exists: ${phone}`);
        return;
      }

      const superAdminRole = await roleRepository.findOne({
        where: { name: 'SUPER_ADMIN', isActive: true },
      });

      if (!superAdminRole) {
        throw new Error('SUPER_ADMIN role not found. Run role seeder first.');
      }

      const user = userRepository.create({
        phone,
        email,
        firstName,
        lastName,
        isActive: true,
        createdBy: 'system',
        roleId: superAdminRole.id,
      });

      await userRepository.save(user);

      const passwordHash = await hashPassword(password);

      const identitiesToCreate = [
        {
          value: phone,
          type: IdentityType.PHONE,
          provider: AuthProvider.LOCAL,
          passwordHash: passwordHash,
          userId: user.id,
        },
      ];

      if (email) {
        identitiesToCreate.push({
          value: email,
          type: IdentityType.EMAIL,
          provider: AuthProvider.LOCAL,
          passwordHash: passwordHash,
          userId: user.id,
        });
      }

      await identityRepository.insert(identitiesToCreate);

      this.logger.log(`Super admin created: ${phone}`);
    });
  }
}
