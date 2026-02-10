import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Min(1, { message: 'Page must be at least 1' })
  @IsNumber({}, { message: 'Page must be a number' })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @Max(100, { message: 'Limit cannot exceed 100' })
  @Min(1, { message: 'Limit must be at least 1' })
  @IsNumber({}, { message: 'Limit must be a number' })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}
