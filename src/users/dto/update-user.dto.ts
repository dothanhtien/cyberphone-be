import {
  IsEmail,
  IsEmpty,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Match } from '@/common/decorators/match.decorator';
import { UserRoles } from '../entities/user.entity';

export class UpdateUserDto {
  @MaxLength(255, { message: 'Email has exceeded 255 characters' })
  @IsEmail({}, { message: 'Email is invalid' })
  @IsOptional()
  email?: string;

  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Full name can only contain letters and spaces',
  })
  @IsOptional()
  fullName?: string;

  @MaxLength(30, { message: 'Phone has exceeded 30 digits' })
  @Matches(/^\d+$/, { message: 'Phone must contain only digits' })
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsOptional()
  password?: string;

  @IsString()
  @Match('password', {
    message: 'Password confirmation and Password do not match',
  })
  @ValidateIf((body: UpdateUserDto) => body.password !== undefined)
  passwordConfirmation?: string;

  @IsEnum(UserRoles, { message: 'Role is invalid' })
  @IsOptional()
  role?: UserRoles;

  @IsEmpty({ message: 'You cannot set isActive' })
  isActive?: boolean;

  @IsEmpty({ message: 'You cannot set lastLogin' })
  lastLogin?: string;

  @IsEmpty({ message: 'You cannot set updatedBy' })
  updatedBy?: string;
}
