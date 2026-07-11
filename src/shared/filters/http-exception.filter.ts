import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';
type ErrorDetails = Record<string, string[]> | null;
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const statusCode = this.getStatusCode(exception);
    const message = this.getMessage(exception);
    const errors = this.getErrors(exception);

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getStatusCode(exception: unknown): number {
    if (
      exception instanceof ZodValidationException ||
      exception instanceof ZodError
    ) {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string {
    if (
      exception instanceof ZodValidationException ||
      exception instanceof ZodError
    ) {
      return 'Validation failed';
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const message = (response as { message: unknown }).message;

        if (Array.isArray(message)) {
          return message[0] || exception.message;
        }

        if (typeof message === 'string') {
          return message;
        }
      }

      return exception.message;
    }

    return 'Internal server error';
  }

  private getErrors(exception: unknown): ErrorDetails {
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodError;
      return zodError.flatten().fieldErrors;
    }

    if (exception instanceof ZodError) {
      return exception.flatten().fieldErrors;
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (
        typeof response === 'object' &&
        response !== null &&
        'errors' in response
      ) {
        return (response as { errors: ErrorDetails }).errors;
      }

      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const message = (response as { message: unknown }).message;

        if (Array.isArray(message)) {
          return {
            _errors: message,
          };
        }
      }
    }

    return null;
  }
}
