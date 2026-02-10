import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CategoryResponseDto {
  @ApiProperty({
    example: 'b7c1c1a2-9a7d-4a9c-b9a0-6b8f6b4f1c2e',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'Electronics',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'electronics',
  })
  @Expose()
  slug: string;

  @ApiProperty({
    example: 'All electronic devices',
    nullable: true,
  })
  @Expose()
  description: string | null;

  @ApiProperty({
    example: 'a3f1c1a2-9a7d-4a9c-b9a0-6b8f6b4f9ddd',
    nullable: true,
  })
  @Expose()
  parentId: string | null;

  @ApiProperty({
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    example: '2026-02-10T08:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: 'admin',
  })
  @Expose()
  createdBy: string;

  @ApiProperty({
    example: '2026-02-11T10:15:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @Expose()
  updatedAt: Date | null;

  @ApiProperty({
    example: 'admin',
    nullable: true,
  })
  @Expose()
  updatedBy: string | null;
}
