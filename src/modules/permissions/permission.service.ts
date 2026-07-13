import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePermissionBody,
  UpdatePermissionBody,
} from './entities/permission.model';
import { PermissionRepository } from './permission.repo';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  findAll() {
    return this.permissionRepository.findAll();
  }

  async findById(permissionId: number) {
    const permission = await this.permissionRepository.findById(permissionId);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  create(body: CreatePermissionBody, userId: number) {
    return this.permissionRepository.create(body, userId);
  }

  async update(body: UpdatePermissionBody, userId: number) {
    await this.findById(body.id);

    return this.permissionRepository.update(body, userId);
  }

  async delete(permissionId: number, userId: number) {
    await this.findById(permissionId);

    await this.permissionRepository.softDelete(permissionId, userId);

    return {
      message: 'Permission deleted successfully',
    };
  }
}
