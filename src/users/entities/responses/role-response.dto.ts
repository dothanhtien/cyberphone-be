import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    example: '3a1f1b2c-9c77-4a0f-9e9a-123456789abc',
  })
  id: string;

  @ApiProperty({ example: 'admin' })
  name: string;

  @ApiProperty({
    example: 'Administrator role',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: true })
  isSystem: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({
    example: '2026-02-07T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({ example: 'system' })
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
