import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Gender } from '@/customers/enums';

const MAX_EMAIL_LENGTH = 320;
const MAX_NAME_LENGTH = 255;

export class CreateCustomerDto {
  @Matches(/^\+?[0-9](?:[0-9\s-]{6,18}[0-9])$/, {
    message: 'Phone number format is invalid',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @MaxLength(MAX_EMAIL_LENGTH, {
    message: `Email must not exceed ${MAX_EMAIL_LENGTH} characters`,
  })
  @IsEmail(
    { ignore_max_length: true },
    { message: 'Email must be a valid email address' },
  )
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
  @IsOptional()
  gender?: Gender;
}
