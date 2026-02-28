import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { CreateCartDto } from './dto/requests/create-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../entities/cart.entity';
import { sanitizeEntityInput } from '@/common/utils/entities';
import { CartCreateEntityInput } from './dto/entity-inputs/cart-create-entity.dto';

dayjs.extend(utc);

@Injectable()
export class StorefrontCartsService {
  private readonly logger = new Logger(StorefrontCartsService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async create(createCartDto: CreateCartDto) {
    const { userId, sessionId } = createCartDto;

    try {
      const existingCart = await this.getCartByUserOrSession(createCartDto);

      existingCart.expiresAt = this.getNewExpiryDate();
      existingCart.updatedBy = userId ?? 'guest';

      this.logger.log(
        `Updating existing cart: id=${existingCart.id}, userId=${userId}, sessionId=${sessionId}`,
      );

      return this.cartRepository.save(existingCart);
    } catch (err) {
      if (!(err instanceof NotFoundException)) throw err;
      this.logger.log(
        `No existing cart found, creating new cart for userId=${userId}, sessionId=${sessionId}`,
      );
    }

    createCartDto.sessionId = sessionId ?? uuid();
    createCartDto.createdBy = userId ?? 'guest';

    const entityInput = sanitizeEntityInput(CartCreateEntityInput, {
      ...createCartDto,
      expiresAt: this.getNewExpiryDate(),
    });

    return this.cartRepository.save(entityInput);
  }

  async getCartByUserOrSession({
    userId,
    sessionId,
  }: {
    userId?: string;
    sessionId?: string;
  }) {
    const now = new Date();

    if (userId) {
      const userCart = await this.cartRepository.findOne({
        where: { userId, isActive: true },
      });

      if (userCart) {
        if (userCart.expiresAt && userCart.expiresAt < now) {
          await this.cartRepository.update(userCart.id, {
            isActive: false,
          });
        } else {
          return userCart;
        }
      }
    }

    if (sessionId) {
      const guestCart = await this.cartRepository.findOne({
        where: {
          sessionId,
          isActive: true,
          expiresAt: MoreThan(now),
        },
      });

      if (guestCart) return guestCart;
    }

    throw new NotFoundException('Cart not found');
  }

  private getNewExpiryDate(): Date {
    return dayjs().utc().add(7, 'day').toDate();
  }
}
