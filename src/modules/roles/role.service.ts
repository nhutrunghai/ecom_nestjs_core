import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  isPrismaErrorCode,
  PrismaErrorCode,
} from 'src/database/prisma-error.util';
import { CreateRoleBody, UpdateRoleBody } from './entities/role.model';
import { RoleRepository } from './role.repo';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  findAll() {
    return this.roleRepository.findAll();
  }

  async findById(roleId: number) {
    const role = await this.roleRepository.findById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async create(body: CreateRoleBody, userId: number) {
    try {
      return await this.roleRepository.create(body, userId);
    } catch (error) {
      if (isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
        throw new ConflictException('Role already exists');
      }

      throw error;
    }
  }

  async update(body: UpdateRoleBody, userId: number) {
    await this.findById(body.id);

    try {
      return await this.roleRepository.update(body, userId);
    } catch (error) {
      if (isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
        throw new ConflictException('Role already exists');
      }

      throw error;
    }
  }

  async delete(roleId: number, userId: number) {
    await this.findById(roleId);

    await this.roleRepository.softDelete(roleId, userId);

    return {
      message: 'Role deleted successfully',
    };
  }
}
