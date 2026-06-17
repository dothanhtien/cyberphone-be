import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateProfileDto } from './dto';
import { AuthUserType } from '@/auth/enums';
import { type AuthUser } from '@/auth/types';
import { comparePassword, hashPassword } from '@/common/utils';
import { CustomersService } from '@/customers/customers.service';
import { IdentitiesService } from '@/identities/identities.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
    private readonly identitiesService: IdentitiesService,
  ) {}

  getProfile(authUser: AuthUser) {
    if (authUser.type === AuthUserType.USER) {
      return this.usersService.findOne(authUser.id);
    }
    return this.customersService.findOne(authUser.id);
  }

  async updateProfile(dto: UpdateProfileDto, authUser: AuthUser) {
    const isUser = authUser.type === AuthUserType.USER;

    const isChangingPassword =
      dto.currentPassword !== undefined || dto.newPassword !== undefined;

    if (isChangingPassword) {
      if (!dto.currentPassword || !dto.newPassword) {
        throw new UnauthorizedException(
          'Both currentPassword and newPassword are required to change password',
        );
      }

      const identity = await this.identitiesService.findOneByAccountId(
        isUser ? { userId: authUser.id } : { customerId: authUser.id },
      );

      if (!identity) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      if (!identity.passwordHash) {
        throw new BadRequestException(
          'Account does not have a local password set',
        );
      }

      if (
        !(await comparePassword(dto.currentPassword, identity.passwordHash))
      ) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    const profileFields = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      updatedBy: authUser.id,
    };

    if (isChangingPassword) {
      const passwordHash = await hashPassword(dto.newPassword!);

      return this.dataSource.transaction(async (tx) => {
        await this.identitiesService.updatePassword(
          isUser
            ? { userId: authUser.id, passwordHash, tx }
            : { customerId: authUser.id, passwordHash, tx },
        );

        if (isUser) {
          return this.usersService.update(authUser.id, profileFields, tx);
        }
        return this.customersService.update(authUser.id, profileFields, tx);
      });
    }

    if (isUser) {
      return this.usersService.update(authUser.id, profileFields);
    }
    return this.customersService.update(authUser.id, profileFields);
  }
}
