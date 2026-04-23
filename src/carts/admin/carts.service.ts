import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CartUpdateEntityDto } from './dto';
import { CART_REPOSITORY, type ICartRepository } from '../repositories';

@Injectable()
export class AdminCartsService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
  ) {}

  /** @internal */
  findOne(id: string, tx: EntityManager) {
    return this.cartRepository.findOne(id, tx);
  }

  /** @internal */
  async update(id: string, data: CartUpdateEntityDto, tx: EntityManager) {
    await this.cartRepository.adminUpdate(id, data, tx);
  }
}
