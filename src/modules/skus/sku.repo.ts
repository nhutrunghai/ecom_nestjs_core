import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type {
  CreateSkuBody,
  UpdateSkuBody,
  UpdateSkuStockBody,
} from './entities/sku.model';

@Injectable()
export class SkuRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findProduct(productId: number) {
    return this.prismaService.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
  }

  findAllByPublishedProduct(productId: number) {
    return this.prismaService.sKU.findMany({
      where: {
        productId,
        deletedAt: null,
        product: {
          deletedAt: null,
          publishedAt: {
            lte: new Date(),
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  findPublishedById(skuId: number) {
    return this.prismaService.sKU.findFirst({
      where: {
        id: skuId,
        deletedAt: null,
        product: {
          deletedAt: null,
          publishedAt: {
            lte: new Date(),
          },
        },
      },
    });
  }

  findActiveById(skuId: number) {
    return this.prismaService.sKU.findFirst({
      where: {
        id: skuId,
        deletedAt: null,
        product: {
          deletedAt: null,
        },
      },
    });
  }

  create(productId: number, data: CreateSkuBody, actorId: number) {
    return this.prismaService.sKU.create({
      data: {
        ...data,
        productId,
        createdById: actorId,
      },
    });
  }

  update(skuId: number, data: UpdateSkuBody, actorId: number) {
    return this.prismaService.sKU.update({
      where: {
        id: skuId,
      },
      data: {
        ...data,
        updatedById: actorId,
      },
    });
  }

  updateStock(skuId: number, data: UpdateSkuStockBody, actorId: number) {
    return this.prismaService.sKU.update({
      where: {
        id: skuId,
      },
      data: {
        stock: data.stock,
        updatedById: actorId,
      },
    });
  }

  countActiveByProduct(productId: number) {
    return this.prismaService.sKU.count({
      where: {
        productId,
        deletedAt: null,
      },
    });
  }

  softDelete(skuId: number, actorId: number) {
    return this.prismaService.sKU.update({
      where: {
        id: skuId,
      },
      data: {
        deletedAt: new Date(),
        deletedById: actorId,
      },
    });
  }
}
