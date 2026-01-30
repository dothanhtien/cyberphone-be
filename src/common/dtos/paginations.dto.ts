import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @Min(1, { message: 'Page must be at least 1' })
  @IsNumber({}, { message: 'Page must be a number' })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Max(100, { message: 'Limit cannot exceed 100' })
  @Min(1, { message: 'Limit must be at least 1' })
  @IsNumber({}, { message: 'Limit must be a number' })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}
