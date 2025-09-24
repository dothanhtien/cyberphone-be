export interface PaginatedEntity<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}
