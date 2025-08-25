import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordService } from 'src/common/password/password.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

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
    throw new UnauthorizedException('Email/Phone or Password is invalid');
  }

  login(user: User) {
    return user;
  }
}
