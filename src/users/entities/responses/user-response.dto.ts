import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from './role-response.dto';

export class UserResponseDto {
  @ApiProperty({
    example: '8f3b9c3a-4e1e-4d6b-9b7c-123456789abc',
  })
  id: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiProperty({ example: 'Admin User' })
  name: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({
    type: RoleResponseDto,
  })
  role: RoleResponseDto;

  @ApiProperty({
    example: '2026-02-07T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({ example: '6b6dd14c-bc3a-4d39-90d2-f375c998ce90' })
  createdBy: string;

  @ApiProperty({
    example: '2026-02-07T09:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  updatedBy: string | null;
}
