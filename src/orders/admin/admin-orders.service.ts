import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderResponseDto } from './dto';
import { OrderMapper } from './mappers';
import { type IOrderRepository, ORDER_REPOSITORY } from '../repositories';
import { PaginationQueryDto } from '@/common/dto';
import { PaginatedEntity } from '@/common/types';
import { extractPaginationParams } from '@/common/utils';

@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async findAll(
    findAllOrdersDto: PaginationQueryDto,
  ): Promise<PaginatedEntity<OrderResponseDto>> {
    const { page, limit } = extractPaginationParams(findAllOrdersDto);
    const offset = (page - 1) * limit;

    this.logger.debug(`[findAll] Fetching orders page=${page}, limit=${limit}`);

    const [orders, totalCount] = await Promise.all([
      this.orderRepository.findAllRaw(limit, offset),
      this.orderRepository.countActive(),
    ]);

    this.logger.log(
      `[findAll] Fetched orders successful page=${page}, count=${orders.length}, total=${totalCount}`,
    );

    return {
      items: orders.map((order) => OrderMapper.mapToOrderResponse(order)),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(id: string) {
    this.logger.debug(`[findOne] Fetching order id=${id}`);

    const order = await this.orderRepository.findOneActive(id);

    if (!order) throw new NotFoundException('Order not found');

    this.logger.log(`[findOne] Fetched order successful id=${id}`);

    return OrderMapper.mapToOrderDetailsResponse(order);
  }
}
