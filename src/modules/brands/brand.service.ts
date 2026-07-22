import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  isPrismaErrorCode,
  PrismaErrorCode,
} from 'src/database/prisma-error.util';
import { BrandRepository } from './brand.repo';
import type { CreateBrandBody, UpdateBrandBody } from './entities/brand.model';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  findAll() {
    return this.brandRepository.findAll();
  }

  async findById(brandId: number) {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(body: CreateBrandBody, actorId: number) {
    try {
      return await this.brandRepository.create(body, actorId);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(brandId: number, body: UpdateBrandBody, actorId: number) {
    await this.findById(brandId);
    try {
      return await this.brandRepository.update(brandId, body, actorId);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async delete(brandId: number, actorId: number) {
    await this.findById(brandId);
    if ((await this.brandRepository.countActiveProducts(brandId)) > 0) {
      throw new ConflictException('Brand is being used by active products');
    }
    await this.brandRepository.softDelete(brandId, actorId);
    return { message: 'Brand deleted successfully' };
  }

  private handleWriteError(error: unknown): never {
    if (isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
      throw new ConflictException('Brand already exists');
    }
    throw error;
  }
}
