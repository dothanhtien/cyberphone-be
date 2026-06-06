import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MaxLength,
  Matches,
  IsUUID,
  IsEmpty,
} from 'class-validator';
import {
  MAX_EMAIL_LENGTH,
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
} from '@/common/constants';

export class CreateUserDto {
  @MaxLength(MAX_EMAIL_LENGTH, {
    message: `Email must not exceed ${MAX_EMAIL_LENGTH} characters`,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Matches(/^(?=.*\d)[0-9+\-\s]{8,20}$/, {
    message: 'Phone number format is invalid',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  phone?: string;

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

  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  @IsNotEmpty({ message: 'roleId is required' })
  roleId: string;

  @IsEmpty({ message: 'createdBy is not allowed to be set manually' })
  createdBy: string;
}
