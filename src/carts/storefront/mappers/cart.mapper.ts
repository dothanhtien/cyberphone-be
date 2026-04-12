import { CartItemMapper } from './cart-item.mapper';
import { CartResponseDto } from '../dto';
import { FindOneCartRaw } from '../types';
import { toDto } from '@/common/utils';

export class CartMapper {
  static mapToCartResponse(input: FindOneCartRaw): CartResponseDto {
    return toDto(CartResponseDto, {
      id: input.id,
      customerId: input.customerId,
      sessionId: input.sessionId,
      expiresAt: input.expiresAt,
      items: input.items.map((item) =>
        CartItemMapper.mapToCartItemResponse(item),
      ),
    });
  }
}
