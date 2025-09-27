import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 'LIMIT_FILE_SIZE') {
      return response.status(400).json({
        statusCode: 400,
        message: 'File too large. Maximum allowed size is 5MB.',
        error: 'Bad Request',
      });
    }

    return response.status(400).json({
      statusCode: 400,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
