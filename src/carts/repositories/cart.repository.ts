import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../entities';
import { Repository } from 'typeorm';
import { CartStatus } from '../enums';

export interface ICartRepository {
  findOneActiveById(id: string): Promise<Cart | null>;
}

export const CART_REPOSITORY = Symbol('ICartRepository');

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
  ) {}

  findOneActiveById(id: string): Promise<Cart | null> {
    return this.cartRepository.findOne({
      where: {
        id,
        status: CartStatus.ACTIVE,
        // expiresAt: MoreThan(new Date()),
      },
    });
  }
}
