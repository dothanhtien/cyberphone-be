import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  Matches,
  IsUUID,
  IsEmpty,
} from 'class-validator';

const MAX_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 320;

export class UpdateUserDto {
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

  @MaxLength(MAX_NAME_LENGTH, {
    message: `First name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  firstName?: string;

  @MaxLength(MAX_NAME_LENGTH, {
    message: `Last name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  lastName?: string;

  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  @IsOptional()
  roleId?: string;

  @IsEmpty({ message: 'lastLogin is not allowed to be set manually' })
  lastLogin?: Date;

  @IsEmpty({ message: 'isActive is not allowed to be set manually' })
  isActive?: boolean;

  @IsEmpty({ message: 'updatedBy is not allowed to be set manually' })
  updatedBy?: string;
}
