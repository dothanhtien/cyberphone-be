import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { MAX_EMAIL_LENGTH } from '@/common/constants';

export class ForgotPasswordDto {
  @MaxLength(MAX_EMAIL_LENGTH, {
    message: `Email must not exceed ${MAX_EMAIL_LENGTH} characters`,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
