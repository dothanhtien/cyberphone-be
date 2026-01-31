import { plainToInstance } from 'class-transformer';

export function toEntity<T>(entityClass: new () => T, data: unknown): T {
  return plainToInstance(entityClass, data, {
    excludeExtraneousValues: true,
  });
}
