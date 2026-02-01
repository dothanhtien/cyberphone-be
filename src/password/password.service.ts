import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  async hashPassword(plainPassword: string, saltRounds = 10) {
    return bcrypt.hash(plainPassword, saltRounds);
  }

  async comparePassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
