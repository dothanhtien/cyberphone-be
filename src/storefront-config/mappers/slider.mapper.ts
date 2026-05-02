import { SliderResponseDto } from '../admin/dto/responses';
import { SliderWithExtras } from '../types';
import { toDto } from '@/common/utils';

export class SliderMapper {
  static mapToResponse(slider: SliderWithExtras): SliderResponseDto {
    return toDto(SliderResponseDto, {
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
