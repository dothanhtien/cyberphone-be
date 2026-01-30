import { PaginationQueryDto } from '../dtos/paginations.dto';

export const extractPaginationParams = (input: PaginationQueryDto) => {
  const page = input.page || 1;
  const limit = input.limit || 20;

  return { page, limit };
};
