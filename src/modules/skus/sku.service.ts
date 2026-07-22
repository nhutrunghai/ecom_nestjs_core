import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  isPrismaErrorCode,
  PrismaErrorCode,
} from 'src/database/prisma-error.util';
import type {
  CreateSkuBody,
  UpdateSkuBody,
  UpdateSkuStockBody,
} from './entities/sku.model';
import { SkuRepository } from './sku.repo';

@Injectable()
export class SkuService {
  constructor(private readonly skuRepository: SkuRepository) {}

  async findAllByPublishedProduct(productId: number) {
    const skus = await this.skuRepository.findAllByPublishedProduct(productId);

    if (skus.length === 0) {
      throw new NotFoundException('Product not found or has no active SKU');
    }

    return skus;
  }

  async findPublishedById(skuId: number) {
    const sku = await this.skuRepository.findPublishedById(skuId);

    if (!sku) {
      throw new NotFoundException('SKU not found');
    }

    return sku;
  }

  async create(productId: number, body: CreateSkuBody, actorId: number) {
    const product = await this.skuRepository.findProduct(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      return await this.skuRepository.create(productId, body, actorId);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(skuId: number, body: UpdateSkuBody, actorId: number) {
    await this.findActiveById(skuId);

    try {
      return await this.skuRepository.update(skuId, body, actorId);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async updateStock(skuId: number, body: UpdateSkuStockBody, actorId: number) {
    await this.findActiveById(skuId);

    return this.skuRepository.updateStock(skuId, body, actorId);
  }

  async delete(skuId: number, actorId: number) {
    const sku = await this.findActiveById(skuId);
    const activeSkuCount = await this.skuRepository.countActiveByProduct(
      sku.productId,
    );

    if (activeSkuCount <= 1) {
      throw new BadRequestException('Cannot delete the last active SKU');
    }

    await this.skuRepository.softDelete(skuId, actorId);

    return {
      message: 'SKU deleted successfully',
    };
  }

  private async findActiveById(skuId: number) {
    const sku = await this.skuRepository.findActiveById(skuId);

    if (!sku) {
      throw new NotFoundException('SKU not found');
    }

    return sku;
  }

  private handleWriteError(error: unknown): never {
    if (isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
      throw new ConflictException(
        'An active SKU with this value already exists in the product',
      );
    }

    if (isPrismaErrorCode(error, PrismaErrorCode.ForeignKeyConstraintFailed)) {
      throw new BadRequestException('Invalid SKU relation');
    }

    throw error;
  }
}
