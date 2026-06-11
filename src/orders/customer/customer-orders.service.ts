import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderResponseDto } from '../admin/dto';
import { OrderMapper } from '../admin/mappers';
import { type IOrderRepository, ORDER_REPOSITORY } from '../repositories';
import { PaginationQueryDto } from '@/common/dto';
import { PaginatedEntity } from '@/common/types';
import { extractPaginationParams } from '@/common/utils';

@Injectable()
export class CustomerOrdersService {
  private readonly logger = new Logger(CustomerOrdersService.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async findAll(
    customerId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedEntity<OrderResponseDto>> {
    const { page, limit } = extractPaginationParams(query);
    const offset = (page - 1) * limit;

    this.logger.debug(
      `[findAll] Fetching orders customerId=${customerId}, page=${page}, limit=${limit}`,
    );

    const [orders, totalCount] = await Promise.all([
      this.orderRepository.findAllByCustomer(customerId, limit, offset),
      this.orderRepository.countByCustomer(customerId),
    ]);

    this.logger.log(
      `[findAll] Fetched orders successful customerId=${customerId}, count=${orders.length}, total=${totalCount}`,
    );

    return {
      items: orders.map((order) => OrderMapper.mapToOrderResponse(order)),
      totalCount,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  async findOne(customerId: string, id: string) {
    this.logger.debug(
      `[findOne] Fetching order id=${id}, customerId=${customerId}`,
    );

    const order =
      await this.orderRepository.findOneActiveWithRelationsByCustomer(
        id,
        customerId,
      );

    if (!order) throw new NotFoundException('Order not found');

    this.logger.log(`[findOne] Fetched order successful id=${id}`);

    return OrderMapper.mapToOrderDetailsResponse(order);
  }
}
