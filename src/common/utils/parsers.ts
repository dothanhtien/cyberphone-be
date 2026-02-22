import { BadRequestException } from '@nestjs/common';

export function safeJsonParse<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new BadRequestException('Invalid JSON format');
  }
}
