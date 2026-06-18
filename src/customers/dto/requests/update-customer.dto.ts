import {
  IsDateString,
  IsEmail,
  IsEmpty,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  MAX_EMAIL_LENGTH,
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
} from '@/common/constants';
import { Gender } from '@/common/enums';

export class UpdateCustomerDto {
  @MaxLength(MAX_EMAIL_LENGTH, {
    message: `Email must not exceed ${MAX_EMAIL_LENGTH} characters`,
  })
  @IsEmail(
    { ignore_max_length: true },
    { message: 'Email must be a valid email address' },
  )
  @IsOptional()
  email?: string;

  @Matches(/^\+?[0-9](?:[0-9\s-]{6,18}[0-9])$/, {
    message: 'Phone number format is invalid',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  phone?: string;

  @MaxLength(MAX_FIRST_NAME_LENGTH, {
    message: `First name must not exceed ${MAX_FIRST_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  firstName?: string;

  @MaxLength(MAX_LAST_NAME_LENGTH, {
    message: `Last name must not exceed ${MAX_LAST_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  lastName?: string;

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

  @IsEmpty()
  updatedBy?: string;
}
