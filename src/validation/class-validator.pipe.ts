import {
  BadRequestException,
  Injectable,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

@Injectable()
export class ClassValidatorPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = ClassValidatorPipe.formatErrors(errors);

        return new BadRequestException({
          message: formattedErrors,
          error: 'Bad Request',
          statusCode: 400,
        });
      },
    });
  }

  private static formatErrors(errors: ValidationError[]): Record<string, any> {
    return errors.reduce(
      (acc, err) => {
        if (err.constraints) {
          const firstError = Object.values(err.constraints)[0];
          acc[err.property] = firstError;
        }
        if (err.children && err.children.length > 0) {
          acc[err.property] = this.formatErrors(err.children);
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }
}
