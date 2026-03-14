import { plainToInstance } from 'class-transformer';

export function toDto<T, V>(cls: new () => T, plain: V): T {
  return plainToInstance(cls, plain, {
    excludeExtraneousValues: true,
  });
}
