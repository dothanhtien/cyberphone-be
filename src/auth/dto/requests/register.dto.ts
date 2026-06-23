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
import {
  MAX_EMAIL_LENGTH,
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
  MAX_PHONE_LENGTH,
} from '@/common/constants';
import { Gender } from '@/common/enums';
import { Match } from '@/common/validators';

export class RegisterDto {
  @MaxLength(MAX_EMAIL_LENGTH, {
    message: `Email must not exceed ${MAX_EMAIL_LENGTH} characters`,
  })
  @IsEmail(
    { ignore_max_length: true },
    { message: 'Email must be a valid email address' },
  )
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Matches(/^\+?[0-9](?:[0-9\s-]{6,30}[0-9])$/, {
    message: 'Phone number format is invalid',
  })
  @MaxLength(MAX_PHONE_LENGTH, {
    message: `Phone must not exceed ${MAX_PHONE_LENGTH} characters`,
  })
  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  phone?: string;

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

  @MaxLength(MAX_FIRST_NAME_LENGTH, {
    message: `First name must not exceed ${MAX_FIRST_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @MaxLength(MAX_LAST_NAME_LENGTH, {
    message: `Last name must not exceed ${MAX_LAST_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsDateString(
    {},
    { message: 'Date of birth must be a valid ISO date (YYYY-MM-DD)' },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date of birth must be in YYYY-MM-DD format',
  })
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender, {
    message: `Gender must be one of: ${Object.values(Gender).join(', ')}`,
  })
  @IsOptional()
  gender?: Gender;
}
