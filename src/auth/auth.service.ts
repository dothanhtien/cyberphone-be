import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { PasswordService } from '@/password/password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
  ) {}

  async validateUser(identifier: string, password: string) {
    const user = await this.usersService.findOneByEmailOrPhone(identifier);

    if (user && user.passwordHash) {
      const doesPasswordMatch = await this.passwordService.comparePassword(
        password,
        user.passwordHash,
      );

      if (doesPasswordMatch) {
        return user;
      }
    }

    return null;
  }
}
