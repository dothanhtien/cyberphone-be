import { IntersectionType } from '@nestjs/mapped-types';
import { DateRangeFilterDto, LimitFilterDto } from './filter.dto';

export class TopProductsFilterDto extends IntersectionType(
  DateRangeFilterDto,
  LimitFilterDto,
) {}
