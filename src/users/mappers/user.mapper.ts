import { UserResponseDto } from '../dto';
import { User } from '../entities';
import { toDto } from '@/common/utils';

export class UserMapper {
  static mapToUserResponse(input: User): UserResponseDto {
    return toDto(UserResponseDto, {
      id: input.id,
      username: input.username,
      phone: input.phone,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
    });
  }
}
