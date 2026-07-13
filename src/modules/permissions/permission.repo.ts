import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  CreatePermissionBody,
  UpdatePermissionBody,
} from './entities/permission.model';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.permission.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: number) {
    return this.prismaService.permission.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  create(data: CreatePermissionBody, userId: number) {
    return this.prismaService.permission.create({
      data: {
        name: data.name,
        description: data.description ?? '',
        path: data.path,
        method: data.method,
        module: data.module ?? '',
        createdById: userId,
      },
    });
  }

  update(data: UpdatePermissionBody, userId: number) {
    return this.prismaService.permission.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description ?? '',
        path: data.path,
        method: data.method,
        module: data.module ?? '',
        updatedById: userId,
      },
    });
  }

  softDelete(id: number, userId: number) {
    return this.prismaService.permission.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });
  }
}
