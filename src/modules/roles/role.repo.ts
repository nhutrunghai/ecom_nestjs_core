import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateRoleBody, UpdateRoleBody } from './entities/role.model';

const roleInclude = {
  permissions: {
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      path: true,
      method: true,
      module: true,
    },
  },
} as const;

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.role.findMany({
      where: {
        deletedAt: null,
      },
      include: roleInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: number) {
    return this.prismaService.role.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: roleInclude,
    });
  }

  create(data: CreateRoleBody, userId: number) {
    return this.prismaService.role.create({
      data: {
        name: data.name,
        description: data.description ?? '',
        isActive: data.isActive ?? true,
        createdById: userId,
        permissions: {
          connect: data.permissionIds.map((id) => ({ id })),
        },
      },
      include: roleInclude,
    });
  }

  update(data: UpdateRoleBody, userId: number) {
    return this.prismaService.role.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description ?? '',
        isActive: data.isActive ?? true,
        updatedById: userId,
        permissions: {
          set: data.permissionIds.map((id) => ({ id })),
        },
      },
      include: roleInclude,
    });
  }

  softDelete(id: number, userId: number) {
    return this.prismaService.role.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
        isActive: false,
      },
    });
  }
}
