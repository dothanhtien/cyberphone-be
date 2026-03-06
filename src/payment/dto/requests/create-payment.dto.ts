import { IsEnum, IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';
import { PaymentProvider } from '@/payment/enums';

export class CreatePaymentDto {
  @IsUUID('4', { message: 'Order Id must be a valid UUID' })
  @IsNotEmpty({ message: 'Order Id is required' })
  orderId: string;

  @IsEnum(PaymentProvider, {
    message: `Payment provider must be one of: ${Object.values(PaymentProvider).join(', ')}`,
  })
  @IsString({ message: 'Payment provider must be a string' })
  @IsNotEmpty({ message: 'Payment provider is required' })
  provider: PaymentProvider;

  @IsUrl(
    {
      require_tld: false,
    },
    { message: 'Redirect URL is invalid' },
  )
  @IsNotEmpty({ message: 'Redirect URL is required' })
  redirectUrl: string;
}
