import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class NonEmptyBodyPipe<
  T extends object = any,
> implements PipeTransform<T> {
  transform(value: T): T {
    if (
      !value ||
      Object.keys(value).length === 0 ||
      Object.values(value).every((v) => v === undefined || v === null)
    ) {
      throw new BadRequestException('Request body cannot be empty');
    }
    return value;
  }
}
