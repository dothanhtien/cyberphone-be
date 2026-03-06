import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Public } from '@/auth/decorators/public.decorator';
import { CreatePaymentDto } from './dto/requests/create-payment.dto';
import type { MomoCallback, MomoReturnQuery } from './types';

@Public()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get('momo/return')
  async momoReturn(@Query() query: MomoReturnQuery) {
    return this.paymentService.handleMomoReturn(query);
  }

  @Post('momo/callback')
  @HttpCode(HttpStatus.NO_CONTENT)
  async momoCallback(@Body() body: MomoCallback) {
    return this.paymentService.handleMomoCallback(body);
  }
}
