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
import { UserRoles } from '../entities/user.entity';
import { Match } from '../../validation/decorators/match.decorator';
import { Exclude } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'john.updated@example.com',
    description: 'User email (must be unique)',
    maxLength: 255,
  })
  @MaxLength(255, { message: 'Email has exceeded 255 characters' })
  @IsEmail({}, { message: 'Email is invalid' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'John Updated',
    description: 'Full name (letters and spaces only)',
  })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Full name can only contain letters and spaces',
  })
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    example: '0912345678',
    description: 'Phone number (only digits, max length 30)',
    maxLength: 30,
  })
  @MaxLength(30, { message: 'Phone has exceeded 30 digits' })
  @Matches(/^\d+$/, { message: 'Phone must contain only digits' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'NewP@ssw0rd!',
    description: 'Password (min 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    example: 'NewP@ssw0rd!',
    description: 'Password confirmation (must match password)',
  })
  @IsString()
  @Match('password', {
    message: 'Password confirmation and Password do not match',
  })
  @ValidateIf((body: UpdateUserDto) => body.password !== undefined)
  passwordConfirmation?: string;

  @ApiPropertyOptional({
    enum: UserRoles,
    description: 'User role',
    example: UserRoles.CUSTOMER,
  })
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
