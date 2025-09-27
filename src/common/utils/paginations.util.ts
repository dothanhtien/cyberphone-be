import { PaginationQueryDto } from '../dto/pagination.dto';

export const extractPaginationParams = (input: PaginationQueryDto) => {
  const page = input.page || 1;
  const limit = input.limit || 10;

  return { page, limit };
};
