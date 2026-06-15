import { CustomerResponseDto } from '../dto';
import { Customer } from '../entities';
import { toDto } from '@/common/utils';

export class CustomerMapper {
  static mapToCustomerResponse(input: Customer): CustomerResponseDto {
    return toDto(CustomerResponseDto, input);
  }
}
