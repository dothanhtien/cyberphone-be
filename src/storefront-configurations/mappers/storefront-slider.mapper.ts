import { StorefrontSliderResponseDto } from '../dto';
import { SliderWithExtras } from '../types';
import { toDto } from '@/common/utils';

export class StorefrontSliderMapper {
  static mapToResponse(slider: SliderWithExtras): StorefrontSliderResponseDto {
    return toDto(StorefrontSliderResponseDto, {
      id: slider.id,
      title: slider.title ?? null,
      altText: slider.altText ?? null,
      url: slider.url ?? null,
      displayOrder: slider.displayOrder,
      isActive: slider.isActive,
      createdAt: slider.createdAt,
      createdBy: slider.createdBy,
      updatedAt: slider.updatedAt ?? null,
      updatedBy: slider.updatedBy ?? null,
    });
  }
}
