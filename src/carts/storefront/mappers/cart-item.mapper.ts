import { CartItemResponseDto } from '../dto';
import { CartItemRaw } from '../types';
import { toDto } from '@/common/utils';

export class CartItemMapper {
  static mapToCartItemResponse(input: CartItemRaw): CartItemResponseDto {
    return toDto(CartItemResponseDto, input);
  }
}
