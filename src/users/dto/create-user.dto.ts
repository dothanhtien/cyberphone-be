import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRoles } from '../entities/user.entity';
import { Match } from 'src/validation/decorators/match.decorator';

export class CreateUserDto {
  @MaxLength(255, { message: 'Email has exceeded 255 characters' })
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @MaxLength(30, { message: 'Phone has exceeded 30 digits' })
  @Matches(/^[0-9]+$/, {
    message: 'Phone must contain only digits',
  })
  @IsOptional()
  phone?: string;

  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Full name can only contain letters and spaces',
  })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString()
  @Match('password', {
    message: 'Password confirmation and Password do not match',
  })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  passwordConfirmation: string;

  @IsEnum(UserRoles, { message: 'Role is invalid' })
  @IsOptional()
  role?: UserRoles;
}
