import { QueryFailedError } from 'typeorm';

interface PostgresError extends Error {
  code?: string;
  detail?: string;
  constraint?: string;
}

export function isUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = (
    error as QueryFailedError & {
      driverError: PostgresError;
    }
  ).driverError;

  return driverError?.code === '23505';
}
