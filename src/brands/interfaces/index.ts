import { Brand } from '../entities/brand.entity';

export interface PaginatedBrands {
  items: Brand[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}
