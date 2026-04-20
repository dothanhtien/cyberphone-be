import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CreatePaymentDto,
  PaymentCreateEntityInput,
  PaymentUpdateEntityInput,
} from './dto';
import { PaymentProvider, PaymentStatus } from './enums';
import { type IPaymentRepository, PAYMENT_REPOSITORY } from './repositories';
import { MomoStrategy } from './strategies';
import {
  MomoCallback,
  MomoReturnQuery,
  PaymentResult,
  PaymentStrategy,
} from './types';
import { AdminCartsService } from '@/carts/admin/carts.service';
import { CartUpdateEntityDto } from '@/carts/admin/dto';
import { CartStatus } from '@/carts/enums';
import { sanitizeEntityInput } from '@/common/utils';
import { AdminOrdersService } from '@/orders/admin/admin-orders.service';
import { OrderUpdateEntityInput } from '@/orders/admin/dto';
import { OrderStatus } from '@/orders/enums';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly strategies: Map<PaymentProvider, PaymentStrategy>;

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly ordersService: AdminOrdersService,
    private readonly cartsService: AdminCartsService,
    private readonly dataSource: DataSource,
    private readonly momoStrategy: MomoStrategy,
  ) {
    this.strategies = new Map<PaymentProvider, PaymentStrategy>([
      [PaymentProvider.MOMO, this.momoStrategy],
    ]);
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const order = await this.ordersService.findOneById(
      createPaymentDto.orderId,
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.orderStatus !== OrderStatus.PENDING) {
      throw new BadRequestException('Order cannot be paid');
    }

    const paymentInput = sanitizeEntityInput(PaymentCreateEntityInput, {
      orderId: order.id,
      provider: createPaymentDto.provider,
      amount: order.orderTotal,
      orderInfo: `Payment for order ${order.code}`,
    });

    const payment = await this.paymentRepository.create(paymentInput);

    this.logger.log(
      `Payment created: ${createPaymentDto.orderId} via ${createPaymentDto.provider}`,
    );

    const strategy = this.getStrategy(createPaymentDto.provider);

    return strategy.createPaymentUrl({ createPaymentDto, order, payment });
  }

  async handleMomoReturn(query: MomoReturnQuery) {
    const result = this.momoStrategy.verifyPayment(query);

    return this.updatePaymentStatus(result);
  }

  async handleMomoCallback(body: MomoCallback): Promise<void> {
    try {
      const result = this.momoStrategy.verifyPayment(body);
      await this.updatePaymentStatus(result);
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.log(error);
      }

      this.logger.error('An error occurred when processing momo ipn', error);
    }
  }

  private getStrategy(provider: PaymentProvider): PaymentStrategy {
    const strategy = this.strategies.get(provider);

    if (!strategy) {
      throw new BadRequestException(
        `Unsupported payment provider: ${provider}`,
      );
    }

    return strategy;
  }

  private async updatePaymentStatus(data: PaymentResult) {
    return this.dataSource.transaction(async (tx) => {
      if (!data.paymentId) {
        throw new NotFoundException('Payment not found or already updated');
      }

      const payment = await this.paymentRepository.findByIdWithLock(
        data.paymentId,
        tx,
      );

      if (!payment) {
        throw new NotFoundException('Payment not found or already updated');
      }

      const order = await this.ordersService.findOneById(payment.orderId, tx);

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (payment.status !== PaymentStatus.PENDING) {
        this.logger.warn(`Duplicate payment callback: ${payment.id}`);

        return {
          id: payment.id,
          status: payment.status,
          orderCode: order.code,
        };
      }

      const updateInput = sanitizeEntityInput(PaymentUpdateEntityInput, {
        status: data.success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
        transactionId: data.transactionId ?? null,
        failureReason: data.success ? null : data.message,
        rawResponse: data.rawData ?? null,
        paidAt: data.success ? new Date() : null,
        paymentMethod: data.orderType ?? null,
      });

      const updatedPayment = await this.paymentRepository.update(
        payment.id,
        updateInput,
        tx,
      );

      order.paymentStatus = updatedPayment.status;
      order.updatedBy = 'system';

      if (updatedPayment.status === PaymentStatus.SUCCESS) {
        order.orderStatus = OrderStatus.COMPLETED;
      }

      await this.ordersService.update(
        order.id,
        sanitizeEntityInput(OrderUpdateEntityInput, order),
        tx,
      );

      const cart = await this.cartsService.findOne(order.cartId);

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      if (updatedPayment.status === PaymentStatus.SUCCESS) {
        cart.status = CartStatus.CONVERTED;
        await this.cartsService.update(
          cart.id,
          sanitizeEntityInput(CartUpdateEntityDto, cart),
          tx,
        );
      }

      this.logger.log(
        `Payment updated: payment=${updatedPayment.id} status=${updatedPayment.status}`,
      );

      return {
        id: updatedPayment.id,
        status: updatedPayment.status,
        orderCode: order.code,
      };
    });
  }
}
