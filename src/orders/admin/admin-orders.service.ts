import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ALLOWED_TRANSITIONS } from './constants';
import {
  OrderResponseDto,
  OrderUpdateEntityInput,
  UpdateOrderStatusDto,
} from './dto';
import { OrderMapper } from './mappers';
import { Order } from '../entities';
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
    private readonly dataSource: DataSource,
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

    const order = await this.orderRepository.findOneActiveWithRelations(id);

    if (!order) throw new NotFoundException('Order not found');

    this.logger.log(`[findOne] Fetched order successful id=${id}`);

    return OrderMapper.mapToOrderDetailsResponse(order);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    updatedBy: string,
    tx?: EntityManager,
  ): Promise<void> {
    const run = async (manager: EntityManager) => {
      const order = await this.orderRepository.findOneActive(id, manager);

      if (!order) throw new NotFoundException('Order not found');

      const allowed = ALLOWED_TRANSITIONS[order.orderStatus];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition order from "${order.orderStatus}" to "${dto.status}"`,
        );
      }

      this.logger.log(
        `[updateStatus] id=${id} ${order.orderStatus} → ${dto.status} by=${updatedBy}`,
      );

      await this.orderRepository.update(
        id,
        { orderStatus: dto.status, updatedBy },
        manager,
      );
    };

    if (tx) {
      await run(tx);
    } else {
      await this.dataSource.transaction(run);
    }
  }

  /** @internal */
  findOneById(id: string, tx?: EntityManager): Promise<Order | null> {
    return this.orderRepository.findOneActive(id, tx);
  }

  /** @internal */
  update(id: string, data: OrderUpdateEntityInput, tx: EntityManager) {
    return this.orderRepository.update(id, data, tx);
  }
}
