import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '@/customers/enums';
import { Match } from '@/common/validators/match.decorator';

const MAX_USERNAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 320;
const MAX_NAME_LENGTH = 255;

export class CreateCustomerDto {
  @MaxLength(MAX_USERNAME_LENGTH, {
    message: `Username must not exceed ${MAX_USERNAME_LENGTH} characters`,
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
  @IsOptional()
  email?: string;

  @MaxLength(MAX_NAME_LENGTH, {
    message: `First name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @MaxLength(MAX_NAME_LENGTH, {
    message: `Last name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsDateString(
    {},
    { message: 'Date of birth must be a valid ISO date (YYYY-MM-DD)' },
  )
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender, {
    message: `Gender must be one of: ${Object.values(Gender).join(', ')}`,
  })
  @IsString({ message: 'Gender must be a string' })
  @IsOptional()
  gender?: Gender;
}
