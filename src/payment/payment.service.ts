import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '@/orders/entities/order.entity';
import { Payment } from './entities/payment.entity';
import {
  MomoCallback,
  MomoReturnQuery,
  PaymentResult,
  PaymentStrategy,
} from './types';
import { PaymentProvider, PaymentStatus } from './enums';
import { CreatePaymentDto } from './dto/requests/create-payment.dto';
import { MomoStrategy } from './strategies/momo.strategy';
import { OrderStatus } from '@/orders/enums';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly strategies: Map<PaymentProvider, PaymentStrategy>;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly dataSource: DataSource,
    private readonly momoStrategy: MomoStrategy,
  ) {
    this.strategies = new Map<PaymentProvider, PaymentStrategy>([
      [PaymentProvider.MOMO, this.momoStrategy],
    ]);
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const order = await this.orderRepository.findOne({
      where: { id: createPaymentDto.orderId, isActive: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.orderStatus !== OrderStatus.PENDING) {
      throw new BadRequestException('Order cannot be paid');
    }

    const payment = await this.paymentRepository.save({
      orderId: order.id,
      provider: createPaymentDto.provider,
      amount: order.orderTotal,
      orderInfo: `Payment for order ${order.code}`,
    });

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
      const paymentRepository = tx.getRepository(Payment);

      const payment = await paymentRepository.findOne({
        where: { id: data.paymentId, status: PaymentStatus.PENDING },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found or already updated');
      }

      payment.status = data.success
        ? PaymentStatus.SUCCESS
        : PaymentStatus.FAILED;

      payment.transactionId = data.transactionId ?? null;
      payment.failureReason = data.success ? null : data.message;
      payment.rawResponse = data.rawData ?? null;
      payment.paidAt = data.success ? new Date() : null;
      payment.paymentMethod = data.orderType ?? null;

      const updatedPayment = await paymentRepository.save(payment);

      if (data.success) {
        await tx.getRepository(Order).update(payment.orderId, {
          // paymentStatus: PaymentStatus.SUCCESS,  // TODO: need to review to remove
          orderStatus: OrderStatus.COMPLETED,
          updatedBy: 'system',
        });
      }

      this.logger.log(
        `Payment updated: payment=${payment.id} status=${payment.status}`,
      );

      return updatedPayment;
    });
  }
}
