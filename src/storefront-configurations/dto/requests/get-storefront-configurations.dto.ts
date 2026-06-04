import { IsEnum, IsOptional } from 'class-validator';
import { StorefrontConfigurationSection } from '../../enums';

export class GetStorefrontConfigurationsDto {
  @IsEnum(StorefrontConfigurationSection, {
    message: `type must be one of: ${Object.values(StorefrontConfigurationSection).join(', ')}`,
  })
  @IsOptional()
  type?: StorefrontConfigurationSection;
}
