import { AuthResponseDto } from '../dto';
import { AuthUserType } from '../enums';
import { AuthUser } from '../types';
import { toDto } from '@/common/utils';
import { Customer } from '@/customers/entities';
import { User } from '@/users/entities';

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
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roleId: user.roleId,
    };
  }

  private static mapCustomer(customer: Customer): AuthUser {
    return {
      id: customer.id,
      type: AuthUserType.CUSTOMER,
      email: customer.email,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      isActive: customer.isActive,
    };
  }
}
