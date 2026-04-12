import { CartItemResponseDto } from '../dto';
import { CartItemRaw } from '../types';
import { toDto } from '@/common/utils';

export class CartItemMapper {
  static mapToCartItemResponse(input: CartItemRaw): CartItemResponseDto {
    return toDto(CartItemResponseDto, {
      id: input.id,
      variantId: input.variantId,
      variantName: input.variantName,
      price: input.price,
      salePrice: input.salePrice,
      quantity: input.quantity,
      stockStatus: input.stockStatus,
      imageUrl: input.imageUrl,
    });
  }
}
