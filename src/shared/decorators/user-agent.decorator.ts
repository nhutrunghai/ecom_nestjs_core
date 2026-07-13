import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const UserAgent = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>();
    const userAgent = request.headers['user-agent'];

    if (Array.isArray(userAgent)) {
      return userAgent[0] ?? '';
    }

    return userAgent ?? '';
  },
);
