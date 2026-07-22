import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type { CreateBrandBody, UpdateBrandBody } from './entities/brand.model';

@Injectable()
export class BrandRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.brand.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  findById(brandId: number) {
    return this.prismaService.brand.findFirst({
      where: { id: brandId, deletedAt: null },
    });
  }

  countActiveProducts(brandId: number) {
    return this.prismaService.product.count({
      where: { brandId, deletedAt: null },
    });
  }

  create(data: CreateBrandBody, actorId: number) {
    return this.prismaService.brand.create({
      data: {
        ...data,
        createdById: actorId,
      },
    });
  }

  update(brandId: number, data: UpdateBrandBody, actorId: number) {
    return this.prismaService.brand.update({
      where: { id: brandId },
      data: {
        ...data,
        updatedById: actorId,
      },
    });
  }

  softDelete(brandId: number, actorId: number) {
    return this.prismaService.brand.update({
      where: { id: brandId },
      data: {
        deletedAt: new Date(),
        deletedById: actorId,
      },
    });
  }
}
