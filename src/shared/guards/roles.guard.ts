import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import type { RoleNameType } from '../constants/role.constants';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { RequestUser } from '../types/jwt-token.type';

type RequestWithUser = Request & {
  user?: RequestUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleNameType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const payload = request.user;

    if (!payload) {
      throw new UnauthorizedException('Authentication is required');
    }

    const user = await this.prismaService.user.findFirst({
      where: {
        id: payload.sub,
        roleId: payload.roleId,
        deletedAt: null,
        role: {
          is: {
            isActive: true,
            deletedAt: null,
          },
        },
      },
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('User or assigned role is no longer active');
    }

    const currentRole = user.role.name as RoleNameType;

    if (!requiredRoles.includes(currentRole)) {
      throw new ForbiddenException('You do not have the required role');
    }

    return true;
  }
}
