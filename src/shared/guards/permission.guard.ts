import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { HTTPMethod } from 'generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CHECK_PERMISSION_KEY } from '../decorators/check-permission.decorator';
import type { RequestUser } from '../types/jwt-token.type';

type RequestWithUser = Request & {
  user?: RequestUser;
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const shouldCheckPermission = this.reflector.getAllAndOverride<boolean>(
      CHECK_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!shouldCheckPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const payload = request.user;

    if (!payload) {
      throw new UnauthorizedException('Authentication is required');
    }

    const method = request.method as HTTPMethod;
    const path = this.getRoutePath(request);

    const userHasPermission = await this.prismaService.user.findFirst({
      where: {
        id: payload.sub,
        roleId: payload.roleId,
        deletedAt: null,
        role: {
          is: {
            isActive: true,
            deletedAt: null,
            permissions: {
              some: {
                method,
                path,
                deletedAt: null,
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!userHasPermission) {
      throw new ForbiddenException(
        `You do not have permission to access ${method} ${path}`,
      );
    }

    return true;
  }

  private getRoutePath(request: RequestWithUser): string {
    const baseUrl = request.baseUrl ?? '';
    const routePath = this.extractRoutePath(request.route as unknown);

    return this.normalizePath(`${baseUrl}${routePath ?? request.path}`);
  }

  private extractRoutePath(route: unknown): string | undefined {
    if (typeof route !== 'object' || route === null || !('path' in route)) {
      return undefined;
    }

    return typeof route.path === 'string' ? route.path : undefined;
  }

  private normalizePath(path: string): string {
    let normalizedPath = path;

    if (!normalizedPath.startsWith('/')) {
      normalizedPath = `/${normalizedPath}`;
    }

    if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1);
    }

    return normalizedPath;
  }
}
