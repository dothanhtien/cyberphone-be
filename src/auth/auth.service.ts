import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/common/password/password.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
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

  async login(user: User) {
    const payload = { sub: user.id };

    let updatedUser: User = user;
    try {
      updatedUser = await this.usersService.update(user.id, {
        lastLogin: new Date().toISOString(),
      });
    } catch (err) {
      console.log(
        `An error occurred when updating lastLogin of user ${user.id}`,
        err,
      );
      throw new InternalServerErrorException(
        'An error occurred when logging in',
      );
    }

    return { data: updatedUser, accessToken: this.jwtService.sign(payload) };
  }
}
