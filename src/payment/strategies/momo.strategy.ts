import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import {
  CreatePaymentUrlParams,
  MomoConfig,
  MomoCreatePaymentUrlRequest,
  MomoCreatePaymentUrlResponse,
  MomoReturnQuery,
  PaymentStrategy,
} from '../types';

@Injectable()
export class MomoStrategy implements PaymentStrategy {
  private readonly logger = new Logger(MomoStrategy.name);
  private readonly config: MomoConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      partnerCode: this.configService.getOrThrow<string>('MOMO_PARTNER_CODE'),
      accessKey: this.configService.getOrThrow<string>('MOMO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MOMO_SECRET_KEY'),
      apiEndpoint: this.configService.getOrThrow<string>('MOMO_API_ENDPOINT'),
      ipnUrl: this.configService.getOrThrow<string>('MOMO_IPN_URL'),
      isSandbox: this.configService.get('MOMO_SANDBOX', 'true') === 'true',
    };
  }

  async createPaymentUrl(params: CreatePaymentUrlParams) {
    const { createPaymentDto, order, payment } = params;

    const requestId = payment.id;
    const orderId = payment.id;

    const requestType = 'payWithMethod';
    const orderInfo = payment.orderInfo ?? '';
    const redirectUrl = createPaymentDto.redirectUrl;

    const amount = Number(payment.amount);

    if (this.config.isSandbox && amount > 50000000) {
      this.logger.warn(
        `MoMo sandbox amount exceeded paymentId=${payment.id} amount=${amount}`,
      );

      throw new BadRequestException(
        'MoMo sandbox only supports amount ≤ 50,000,000 VND',
      );
    }

    const extraData = Buffer.from(
      JSON.stringify({
        paymentId: payment.id,
        orderCode: order.code,
      }),
    ).toString('base64');

    /**
     * accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo
     *            &partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
     */
    const rawSignature = [
      `accessKey=${this.config.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${this.config.ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${this.config.partnerCode}`,
      `redirectUrl=${redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join('&');

    const signature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');

    this.logger.log(`signature: ${signature}`);

    // TODO: add items to show them in Momo redirect page
    const requestBody: MomoCreatePaymentUrlRequest = {
      partnerCode: this.config.partnerCode,
      storeId: 'CyberPhone',
      requestId,
      amount,
      orderId: orderId,
      orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: this.config.ipnUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    this.logger.log(`requestBody: ${JSON.stringify(requestBody)}`);

    try {
      const response = await axios.post<MomoCreatePaymentUrlResponse>(
        this.config.apiEndpoint,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(requestBody)),
          },
        },
      );

      if (response.data.resultCode === 0) {
        this.logger.log(`MoMo payment url created for paymentId=${payment.id}`);
        return { payUrl: response.data.payUrl };
      }

      throw new Error(`MoMo error: ${response.data.message}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        `MoMo createPaymentUrl failed: ${err.message}`,
        err.stack,
      );

      throw new BadRequestException('Unable to create MoMo payment');
    }
  }

  verifyPayment(query: MomoReturnQuery) {
    const {
      partnerCode,
      orderId,
      amount,
      extraData,
      orderInfo,
      message,
      orderType,
      payType,
      requestId,
      responseTime,
      resultCode,
      transId,
      signature,
    } = query;

    if (partnerCode !== this.config.partnerCode) {
      throw new BadRequestException('Invalid partnerCode');
    }

    const rawSignature = [
      `accessKey=${this.config.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join('&');

    const expectedSignature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      this.logger.warn(`MoMo invalid signature for order: ${orderId}`);

      throw new BadRequestException('Invalid signature');
    }

    const success = Number(resultCode) === 0;

    this.logger.log(
      `MoMo payment verified paymentId=${requestId} success=${success}`,
    );

    return {
      success,
      paymentId: requestId,
      transactionId: transId,
      orderType,
      message,
      rawData: query,
    };
  }
}
