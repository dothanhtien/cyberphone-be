import {
  IsEmail,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRoles } from '../entities/user.entity';
import { Match } from '../../validation/decorators/match.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email (must be unique)',
    maxLength: 255,
  })
  @MaxLength(255, { message: 'Email has exceeded 255 characters' })
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiPropertyOptional({
    example: '0987654321',
    description: 'Phone number (only digits, max length 30)',
    maxLength: 30,
  })
  @MaxLength(30, { message: 'Phone has exceeded 30 digits' })
  @Matches(/^[0-9]+$/, {
    message: 'Phone must contain only digits',
  })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name (letters and spaces only)',
  })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Full name can only contain letters and spaces',
  })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description: 'Password (min 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description: 'Password confirmation (must match password)',
  })
  @IsString()
  @Match('password', {
    message: 'Password confirmation and Password do not match',
  })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  passwordConfirmation: string;

  @ApiPropertyOptional({
    enum: UserRoles,
    description: 'User role',
    example: UserRoles.CUSTOMER,
  })
  @IsEnum(UserRoles, { message: 'Role is invalid' })
  @IsOptional()
  role?: UserRoles;

  @IsEmpty({ message: 'You cannot set createdBy' })
  createdBy?: string;
}
