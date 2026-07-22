import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import type { CheckoutBody, OrderListQuery } from './entities/order.model';

const orderInclude = {
  payment: {
    select: {
      id: true,
      status: true,
    },
  },
  shop: {
    select: {
      id: true,
      name: true,
    },
  },
  items: {
    orderBy: {
      id: 'asc',
    },
  },
} as const;

export class CheckoutItemUnavailableError extends Error {}
export class OrderStateChangedError extends Error {}

@Injectable()
export class OrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async checkout(userId: number, body: CheckoutBody) {
    return this.prismaService.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: {
          id: { in: body.cartItemIds },
          userId,
        },
        include: {
          sku: {
            include: {
              product: {
                include: {
                  productTranslations: {
                    where: { deletedAt: null },
                    select: {
                      languageId: true,
                      name: true,
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (cartItems.length !== body.cartItemIds.length) {
        throw new CheckoutItemUnavailableError('Cart item not found');
      }

      const claimedItems = await tx.cartItem.deleteMany({
        where: {
          id: { in: body.cartItemIds },
          userId,
        },
      });

      if (claimedItems.count !== body.cartItemIds.length) {
        throw new CheckoutItemUnavailableError(
          'One or more cart items are already being checked out',
        );
      }

      const payment = await tx.payment.create({
        data: { status: PaymentStatus.PENDING },
      });
      const itemsByShop = new Map<number, typeof cartItems>();

      for (const item of cartItems) {
        const product = item.sku.product;
        const stockUpdate = await tx.sKU.updateMany({
          where: {
            id: item.skuId,
            deletedAt: null,
            stock: { gte: item.quantity },
            product: {
              deletedAt: null,
              publishedAt: { lte: new Date() },
            },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new CheckoutItemUnavailableError(
            `${product.name} - ${item.sku.value} is unavailable or out of stock`,
          );
        }

        const shopItems = itemsByShop.get(product.createdById) ?? [];
        shopItems.push(item);
        itemsByShop.set(product.createdById, shopItems);
      }

      const orders: Prisma.OrderGetPayload<{
        include: typeof orderInclude;
      }>[] = [];

      for (const [shopId, shopItems] of itemsByShop) {
        const productIds = [
          ...new Set(shopItems.map((item) => item.sku.productId)),
        ];
        const order = await tx.order.create({
          data: {
            userId,
            status: OrderStatus.PENDING_PAYMENT,
            receiver: body.receiver,
            shopId,
            paymentId: payment.id,
            createdById: userId,
            products: {
              connect: productIds.map((id) => ({ id })),
            },
            items: {
              create: shopItems.map((item) => ({
                productName: item.sku.product.name,
                skuPrice: item.sku.price,
                image: item.sku.image,
                skuValue: item.sku.value,
                skuId: item.sku.id,
                quantity: item.quantity,
                productId: item.sku.productId,
                productTranslations: item.sku.product.productTranslations,
              })),
            },
          },
          include: orderInclude,
        });
        orders.push(order);
      }

      return { paymentId: payment.id, orders };
    });
  }

  findRoleName(userId: number) {
    return this.prismaService.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { role: { select: { name: true } } },
    });
  }

  findByIdForUser(orderId: number, userId: number) {
    return this.prismaService.order.findFirst({
      where: { id: orderId, userId, deletedAt: null },
      include: orderInclude,
    });
  }

  findByIdForManagement(orderId: number, shopId?: number) {
    return this.prismaService.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
        ...(shopId ? { shopId } : {}),
      },
      include: orderInclude,
    });
  }

  findAllForUser(userId: number, query: OrderListQuery) {
    return this.findAll({ userId }, query);
  }

  findAllForManagement(shopId: number | undefined, query: OrderListQuery) {
    return this.findAll(shopId ? { shopId } : {}, query);
  }

  changeStatus(
    orderId: number,
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
    actorId: number,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: {
          id: orderId,
          status: currentStatus,
          deletedAt: null,
        },
        data: {
          status: nextStatus,
          updatedById: actorId,
        },
      });

      if (result.count !== 1) {
        throw new OrderStateChangedError();
      }

      if (
        nextStatus === OrderStatus.CANCELLED ||
        nextStatus === OrderStatus.RETURNED
      ) {
        const items = await tx.productSKUSnapshot.findMany({
          where: { orderId, skuId: { not: null } },
          select: { skuId: true, quantity: true },
        });

        for (const item of items) {
          if (item.skuId !== null) {
            await tx.sKU.updateMany({
              where: { id: item.skuId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: orderInclude,
      });
    });
  }

  private async findAll(scope: Prisma.OrderWhereInput, query: OrderListQuery) {
    const where: Prisma.OrderWhereInput = {
      ...scope,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prismaService.order.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
