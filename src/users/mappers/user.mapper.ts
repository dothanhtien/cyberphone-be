import { UserResponseDto } from '../dto';
import { User } from '../entities';
import { toDto } from '@/common/utils';

export class UserMapper {
  static mapToUserResponse(input: User): UserResponseDto {
    return toDto(UserResponseDto, input);
  }
}
