import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@/orders/enums';

const MAX_NAME_LENGTH = 255;
const MAX_PHONE_LENGTH = 30;
const MAX_EMAIL_LENGTH = 320;
const MAX_ADDRESS_LENGTH = 255;
const MAX_CITY_LENGTH = 100;
const MAX_STATE_LENGTH = 100;
const MAX_DISTRICT_LENGTH = 100;
const MAX_WARD_LENGTH = 100;
const MAX_COUNTRY_LENGTH = 100;

export class CreateOrderDto {
  @IsUUID('4', { message: 'Cart Id must be a valid UUID' })
  @IsNotEmpty({ message: 'Cart Id is required' })
  cartId: string;

  @MaxLength(MAX_NAME_LENGTH, {
    message: `Shipping name must not exceed ${MAX_NAME_LENGTH} characters`,
  })
  @IsString({ message: 'Shipping name must be a string' })
  @IsNotEmpty({ message: 'Shipping name is required' })
  shippingName: string;

  @MaxLength(MAX_PHONE_LENGTH, {
    message: `Shipping phone must not exceed ${MAX_PHONE_LENGTH} characters`,
  })
  @IsString({ message: 'Shipping phone must be a string' })
  @IsNotEmpty({ message: 'Shipping phone is required' })
  shippingPhone: string;

  @MaxLength(MAX_EMAIL_LENGTH, {
    message: `Shipping email must not exceed ${MAX_EMAIL_LENGTH} characters`,
  })
  @IsString({ message: 'Shipping email must be a string' })
  @IsOptional()
  shippingEmail?: string;

  @MaxLength(MAX_ADDRESS_LENGTH, {
    message: `Address line 1 must not exceed ${MAX_ADDRESS_LENGTH} characters`,
  })
  @IsString({ message: 'Shipping address line 1 must be a string' })
  @IsNotEmpty({ message: 'Shipping address line 1 is required' })
  shippingAddressLine1: string;

  @MaxLength(MAX_ADDRESS_LENGTH, {
    message: `Address line 2 must not exceed ${MAX_ADDRESS_LENGTH} characters`,
  })
  @IsString({ message: 'Shipping address line 2 must be a string' })
  @IsOptional()
  shippingAddressLine2?: string;

  @MaxLength(MAX_CITY_LENGTH, {
    message: `City must not exceed ${MAX_CITY_LENGTH} characters`,
  })
  @IsString({ message: 'Shipping city must be a string' })
  @IsNotEmpty({ message: 'Shipping city is required' })
  shippingCity: string;

  @MaxLength(MAX_STATE_LENGTH, {
    message: `State must not exceed ${MAX_STATE_LENGTH} characters`,
  })
  @IsString({ message: 'Shipping state must be a string' })
  @IsOptional()
  shippingState?: string;

  @MaxLength(MAX_DISTRICT_LENGTH, {
    message: `District must not exceed ${MAX_DISTRICT_LENGTH} characters`,
  })
  @IsString({ message: 'Shipping district must be a string' })
  @IsNotEmpty({ message: 'Shipping district is required' })
  shippingDistrict: string;

  @MaxLength(MAX_WARD_LENGTH, {
    message: `Ward must not exceed ${MAX_WARD_LENGTH} characters`,
  })
  @IsString({ message: 'Shipping ward must be a string' })
  @IsNotEmpty({ message: 'Shipping ward is required' })
  shippingWard: string;

  @MaxLength(20, { message: 'Postal code must not exceed 20 characters' })
  @IsString({ message: 'Shipping postal code must be a string' })
  @IsOptional()
  shippingPostalCode?: string;

  @MaxLength(MAX_COUNTRY_LENGTH, {
    message: `Country must not exceed ${MAX_COUNTRY_LENGTH} characters`,
  })
  @IsString({ message: 'Shipping country must be a string' })
  @IsOptional()
  shippingCountry?: string;

  @IsString({ message: 'Shipping note must be a string' })
  @IsOptional()
  shippingNote?: string;

  @IsEnum(PaymentMethod, {
    message: `Payment method must be one of: ${Object.values(PaymentMethod).join(', ')}`,
  })
  @IsString({ message: 'Payment method must be a string' })
  @IsNotEmpty({ message: 'Payment method is required' })
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentStatus, {
    message: `Payment status must be one of: ${Object.values(PaymentStatus).join(', ')}`,
  })
  @IsOptional()
  paymentStatus?: PaymentStatus = PaymentStatus.PENDING;

  @IsString({ message: 'Shipping method must be a string' })
  @IsNotEmpty({ message: 'Shipping method is required' })
  shippingMethod: string;

  @IsString({ message: 'Note must be a string' })
  @IsOptional()
  note?: string;
}
