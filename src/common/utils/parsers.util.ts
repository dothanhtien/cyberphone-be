import { BadRequestException } from '@nestjs/common';

export function safeJsonParse<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new BadRequestException('Invalid JSON format');
  }
}

export function toOptionalBoolean(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return value;
}
