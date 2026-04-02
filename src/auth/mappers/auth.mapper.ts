import { AuthResponseDto } from '../dto';
import { AuthUser } from '../types';
import { toDto } from '@/common/utils';
import { Customer } from '@/customers/entities';
import { User } from '@/users/entities';
import { AuthUserType } from '../enums';

export class AuthMapper {
  static mapToAuthUser(entity: User | Customer): AuthUser {
    if (this.isUser(entity)) {
      return this.mapUser(entity);
    }

    return this.mapCustomer(entity);
  }

  private static isUser(entity: any): entity is User {
    return 'role' in entity;
  }

  static mapToAuthResponse(user: AuthUser): AuthResponseDto {
    return toDto(AuthResponseDto, user);
  }

  private static mapUser(user: User): AuthUser {
    return {
      id: user.id,
      type: AuthUserType.USER,
      username: user.username,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      role: user.role,
      passwordHash: user.passwordHash,
    };
  }

  private static mapCustomer(customer: Customer): AuthUser {
    return {
      id: customer.id,
      type: AuthUserType.CUSTOMER,
      username: customer.username,
      email: customer.email,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      isActive: customer.isActive,
      passwordHash: customer.passwordHash,
    };
  }
}
