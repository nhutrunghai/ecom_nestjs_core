import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import type {
  CreateReviewBody,
  ReviewListQuery,
  UpdateReviewBody,
} from './entities/review.model';

const reviewInclude = {
  user: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
  medias: {
    orderBy: { id: 'asc' },
  },
} as const;

export class ReviewAlreadyUpdatedError extends Error {}

@Injectable()
export class ReviewRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(productId: number, query: ReviewListQuery) {
    const where: Prisma.ReviewWhereInput = {
      productId,
      ...(query.rating ? { rating: query.rating } : {}),
      product: {
        deletedAt: null,
        publishedAt: { lte: new Date() },
      },
    };
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.review.findMany({
        where,
        include: reviewInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prismaService.review.count({ where }),
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

  findDeliveredPurchase(orderId: number, productId: number, userId: number) {
    return this.prismaService.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: OrderStatus.DELIVERED,
        deletedAt: null,
        items: { some: { productId } },
      },
      select: { id: true },
    });
  }

  findOwnedById(reviewId: number, userId: number) {
    return this.prismaService.review.findFirst({
      where: { id: reviewId, userId },
      include: reviewInclude,
    });
  }

  create(
    orderId: number,
    productId: number,
    userId: number,
    data: CreateReviewBody,
  ) {
    return this.prismaService.review.create({
      data: {
        orderId,
        productId,
        userId,
        content: data.content,
        rating: data.rating,
        medias: {
          create: data.medias,
        },
      },
      include: reviewInclude,
    });
  }

  update(reviewId: number, data: UpdateReviewBody) {
    return this.prismaService.$transaction(async (tx) => {
      const updated = await tx.review.updateMany({
        where: { id: reviewId, updateCount: { lt: 1 } },
        data: {
          content: data.content,
          rating: data.rating,
          updateCount: { increment: 1 },
        },
      });

      if (updated.count !== 1) {
        throw new ReviewAlreadyUpdatedError();
      }

      if (data.medias) {
        await tx.reviewMedia.deleteMany({ where: { reviewId } });

        if (data.medias.length > 0) {
          await tx.reviewMedia.createMany({
            data: data.medias.map((media) => ({ ...media, reviewId })),
          });
        }
      }

      return tx.review.findUniqueOrThrow({
        where: { id: reviewId },
        include: reviewInclude,
      });
    });
  }

  delete(reviewId: number) {
    return this.prismaService.review.delete({
      where: { id: reviewId },
    });
  }
}
