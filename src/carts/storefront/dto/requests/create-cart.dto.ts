import { IsEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsUUID('4', { message: 'User Id must be a valid UUID (v4)' })
  @IsOptional()
  userId?: string;

  @IsUUID('4', { message: 'Session Id must be a valid UUID (v4)' })
  @IsOptional()
  sessionId?: string;

  @IsEmpty()
  createdBy: string;
}
