import { plainToInstance } from 'class-transformer';

/**
 * @deprecated
 * Use `sanitizeEntityInput` with a dedicated EntityInput DTO instead.
 *
 * TODO:
 * - Review all usages of this method
 * - Introduce explicit EntityInput DTOs with `@Expose` (allow-list)
 * - Remove `@Expose` decorators from Entity classes
 * - Migrate to `sanitizeEntityInput`
 */
export function toEntity<T>(entityClass: new () => T, data: unknown): T {
  return plainToInstance(entityClass, data, {
    excludeExtraneousValues: true,
  });
}

export function sanitizeEntityInput<T>(
  entityClass: new () => T,
  data: unknown,
): T {
  return plainToInstance(entityClass, data, {
    excludeExtraneousValues: true,
  });
}
