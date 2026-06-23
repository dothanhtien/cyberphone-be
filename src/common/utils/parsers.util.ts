import { BadRequestException } from '@nestjs/common';
import { plainToInstance, type TransformFnParams } from 'class-transformer';

export function safeJsonParse<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new BadRequestException('Invalid JSON format');
  }
}

export function transformJsonArray<T>(
  cls: new (...args: unknown[]) => T,
): (params: TransformFnParams) => unknown {
  return ({ value }: TransformFnParams) => {
    let parsed: unknown = value;

    if (typeof value === 'string') {
      parsed = safeJsonParse<unknown>(value);
    }

    if (!Array.isArray(parsed)) {
      return parsed;
    }

    return parsed.map((item) => plainToInstance(cls, item));
  };
}

export function transformJsonString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? safeJsonParse(value) : value;
}

export function toOptionalBoolean(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return value;
}

export function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return Number(value);
}
