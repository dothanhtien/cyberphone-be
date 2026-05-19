import { Expose } from 'class-transformer';
import { StorefrontConfigurationType } from '@/storefront-configurations/enums';

export class StorefrontConfigurationCreateEntityInput {
  @Expose()
  categoryId: string;

  @Expose()
  title?: string | null;

  @Expose()
  icon?: string | null;

  @Expose()
  displayOrder: number;

  @Expose()
  type: StorefrontConfigurationType;

  @Expose()
  isActive: boolean;

  @Expose()
  createdBy: string;
}
