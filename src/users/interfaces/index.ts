import { User } from '../entities/user.entity';

export interface PaginatedUsers {
  items: User[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}
