import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const contextType = host.getType<'rpc' | 'http'>();
    let code = exception?.response?.statusCode ?? 500;
    let error = exception?.response?.error ?? 'Internal server error';
    let message = exception?.response?.message ?? 'Internal server error';

    console.log(exception, 'EXCEPTION');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Prisma error handling block
    if (
      exception &&
      exception.constructor.name == 'PrismaClientKnownRequestError'
    ) {
      code = HttpStatus.BAD_REQUEST;
      error = `PrismaError: ${exception.meta.cause} ${exception.meta.modelName}!`;
    } else if (exception instanceof HttpException) {
      code = exception.getStatus();
      const res: any = exception.getResponse();
      error = res.error ?? exception.name;
      message = res.message ?? exception.message;

      if (contextType === 'rpc') {
        throw new RpcException({
          statusCode: code,
          error,
          message,
        });
      }
    }

    const body = {
      code,
      error,
      message,
    };

    if (contextType === 'http') {
      return response.status(code).json(body);
    }

    if (contextType === 'rpc') {
      throw new RpcException(body);
    }

    return new RpcException(body);
  }
}
