import { Match } from '@/common/validators/match.decorator';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MaxLength,
  MinLength,
  Matches,
  IsUUID,
  IsEmpty,
} from 'class-validator';

const MAX_USERNAME_LENGTH = 255;
const MIN_USERNAME_LENGTH = 3;
const MAX_FULL_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 320;

export class CreateUserDto {
  @MaxLength(MAX_USERNAME_LENGTH, {
    message: `Username must not exceed ${MAX_USERNAME_LENGTH} characters`,
  })
  @MinLength(MIN_USERNAME_LENGTH, {
    message: `Username must be at least ${MIN_USERNAME_LENGTH} characters long`,
  })
  @Matches(/^[a-zA-Z0-9_.]+$/, {
    message:
      'Username can only contain letters, numbers, dots, and underscores',
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @Matches(/^[0-9+\-\s]{8,20}$/, {
    message: 'Phone number format is invalid',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @Match('password', {
    message: 'Password confirmation does not match password',
  })
  @IsString({ message: 'Password confirmation must be a string' })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  passwordConfirmation: string;

  @MaxLength(MAX_EMAIL_LENGTH, {
    message: `Email must not exceed ${MAX_EMAIL_LENGTH} characters`,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsString({ message: 'Email must be a string' })
  @IsOptional()
  email?: string;

  @MaxLength(MAX_FULL_NAME_LENGTH, {
    message: `Full name must not exceed ${MAX_FULL_NAME_LENGTH} characters`,
  })
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  @IsNotEmpty({ message: 'roleId is required' })
  roleId: string;

  @IsEmpty({ message: 'createdBy is not allowed to be set manually' })
  createdBy: string;
}
