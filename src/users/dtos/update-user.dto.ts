import { Match } from '@/common/validators/match.decorator';
import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  MinLength,
  Matches,
  IsUUID,
  IsEmpty,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

const MAX_USERNAME_LENGTH = 255;
const MIN_USERNAME_LENGTH = 3;
const MAX_FULL_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 320;

export class UpdateUserDto {
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
  @IsOptional()
  username?: string;

  @Matches(/^[0-9+\-\s]{8,20}$/, {
    message: 'Phone number format is invalid',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  phone?: string;

  @MaxLength(MAX_EMAIL_LENGTH, {
    message: `Email must not exceed ${MAX_EMAIL_LENGTH} characters`,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsString({ message: 'Email must be a string' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  @ValidateIf((body: UpdateUserDto) => body.password !== undefined)
  currentPassword?: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @Match('password', {
    message: 'Password confirmation and Password do not match',
  })
  @ValidateIf((body: UpdateUserDto) => body.password !== undefined)
  passwordConfirmation?: string;

  @MaxLength(MAX_FULL_NAME_LENGTH, {
    message: `Full name must not exceed ${MAX_FULL_NAME_LENGTH} characters`,
  })
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @IsString({ message: 'Full name must be a string' })
  @IsOptional()
  fullName?: string;

  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  @IsOptional()
  roleId?: string;

  @IsEmpty({ message: 'isActive is not allowed to be set manually' })
  isActive?: boolean;

  @IsEmpty({ message: 'updatedBy is not allowed to be set manually' })
  updatedBy: string;
}
