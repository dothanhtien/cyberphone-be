import * as bcrypt from 'bcryptjs';

export function hashPassword(plainPassword: string, saltRounds = 10) {
  return bcrypt.hash(plainPassword, saltRounds);
}

export function comparePassword(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
