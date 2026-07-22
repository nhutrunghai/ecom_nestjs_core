import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

const cartItemInclude = {
  sku: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          images: true,
          publishedAt: true,
          deletedAt: true,
        },
      },
    },
  },
} as const;

export class CartSkuUnavailableError extends Error {}

export class CartStockExceededError extends Error {
  constructor(readonly stock: number) {
    super();
  }
}

@Injectable()
export class CartRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAllByUser(userId: number) {
    return this.prismaService.cartItem.findMany({
      where: { userId },
      include: cartItemInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findAvailableSku(skuId: number) {
    return this.prismaService.sKU.findFirst({
      where: {
        id: skuId,
        deletedAt: null,
        product: {
          deletedAt: null,
          publishedAt: { lte: new Date() },
        },
      },
      select: {
        id: true,
        stock: true,
      },
    });
  }

  findByIdAndUser(cartItemId: number, userId: number) {
    return this.prismaService.cartItem.findFirst({
      where: { id: cartItemId, userId },
      include: cartItemInclude,
    });
  }

  addItem(userId: number, skuId: number, quantity: number) {
    return this.prismaService.$transaction(async (tx) => {
      const sku = await tx.sKU.findFirst({
        where: {
          id: skuId,
          deletedAt: null,
          product: {
            deletedAt: null,
            publishedAt: { lte: new Date() },
          },
        },
        select: { stock: true },
      });

      if (!sku) {
        throw new CartSkuUnavailableError();
      }

      const item = await tx.cartItem.upsert({
        where: { userId_skuId: { userId, skuId } },
        create: { userId, skuId, quantity },
        update: { quantity: { increment: quantity } },
        include: cartItemInclude,
      });

      if (item.quantity > sku.stock) {
        throw new CartStockExceededError(sku.stock);
      }

      return item;
    });
  }

  update(cartItemId: number, quantity: number) {
    return this.prismaService.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: cartItemInclude,
    });
  }

  delete(cartItemId: number) {
    return this.prismaService.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  clear(userId: number) {
    return this.prismaService.cartItem.deleteMany({
      where: { userId },
    });
  }
}
