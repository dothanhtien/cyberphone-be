import { plainToInstance } from 'class-transformer';

export function toDto<T>(cls: new () => T, plain: T): T {
  return plainToInstance(cls, plain, {
    excludeExtraneousValues: true,
  });
}
