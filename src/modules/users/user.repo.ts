import { Injectable } from '@nestjs/common';
import { UserStatus } from 'generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import type { CreateUserBody, UpdateUserBody } from './entities/user.model';

const userSelect = {
  id: true,
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  status: true,
  roleId: true,
  role: {
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  },
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.user.findMany({
      where: {
        deletedAt: null,
      },
      select: userSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(userId: number) {
    return this.prismaService.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: userSelect,
    });
  }

  findActiveRole(roleId: number) {
    return this.prismaService.role.findFirst({
      where: {
        id: roleId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
  }

  create(data: CreateUserBody, hashedPassword: string, actorId: number) {
    return this.prismaService.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        phoneNumber: data.phoneNumber,
        avatar: data.avatar,
        status: data.status ?? UserStatus.INACTIVE,
        roleId: data.roleId,
        createdById: actorId,
      },
      select: userSelect,
    });
  }

  async update(
    userId: number,
    data: UpdateUserBody,
    hashedPassword: string | undefined,
    actorId: number,
    invalidateSessions: boolean,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          phoneNumber: data.phoneNumber,
          avatar: data.avatar,
          status: data.status,
          roleId: data.roleId,
          updatedById: actorId,
        },
        select: userSelect,
      });

      if (invalidateSessions) {
        await tx.refreshToken.deleteMany({
          where: {
            userId,
          },
        });

        await tx.device.updateMany({
          where: {
            userId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
      }

      return user;
    });
  }

  softDelete(userId: number, actorId: number) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({
        where: {
          userId,
        },
      });

      await tx.device.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      return tx.user.update({
        where: {
          id: userId,
        },
        data: {
          deletedAt: new Date(),
          deletedById: actorId,
        },
      });
    });
  }
}
