import { Expose } from 'class-transformer';

export class StorefrontConfigurationUpdateEntityInput {
  @Expose()
  title?: string | null;

  @Expose()
  icon?: string | null;

  @Expose()
  displayOrder?: number;

  @Expose()
  isActive?: boolean;

  @Expose()
  updatedBy: string;
}
