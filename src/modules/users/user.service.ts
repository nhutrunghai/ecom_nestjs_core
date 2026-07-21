import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserStatus } from 'generated/prisma/client';
import {
  isPrismaErrorCode,
  PrismaErrorCode,
} from 'src/database/prisma-error.util';
import { HashingService } from 'src/shared/hashings/hashing.service';
import type { CreateUserBody, UpdateUserBody } from './entities/user.model';
import { UserRepository } from './user.repo';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
  ) {}

  findAll() {
    return this.userRepository.findAll();
  }

  async findById(userId: number) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(body: CreateUserBody, actorId: number) {
    await this.ensureRoleExists(body.roleId);
    const hashedPassword = await this.hashingService.hash(body.password);

    try {
      return await this.userRepository.create(body, hashedPassword, actorId);
    } catch (error) {
      if (isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async update(userId: number, body: UpdateUserBody, actorId: number) {
    const currentUser = await this.findById(userId);

    if (body.roleId !== undefined) {
      await this.ensureRoleExists(body.roleId);
    }

    const hashedPassword = body.password
      ? await this.hashingService.hash(body.password)
      : undefined;

    const invalidateSessions =
      body.password !== undefined ||
      (body.roleId !== undefined && body.roleId !== currentUser.roleId) ||
      (body.status !== undefined && body.status !== UserStatus.ACTIVE);

    try {
      return await this.userRepository.update(
        userId,
        body,
        hashedPassword,
        actorId,
        invalidateSessions,
      );
    } catch (error) {
      if (isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async delete(userId: number, actorId: number) {
    if (userId === actorId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    await this.findById(userId);
    await this.userRepository.softDelete(userId, actorId);

    return {
      message: 'User deleted successfully',
    };
  }

  private async ensureRoleExists(roleId: number) {
    const role = await this.userRepository.findActiveRole(roleId);

    if (!role) {
      throw new BadRequestException('Role not found or inactive');
    }
  }
}
