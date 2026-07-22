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
  CreateReviewBody,
  ReviewListQuery,
  UpdateReviewBody,
} from './entities/review.model';
import { ReviewAlreadyUpdatedError, ReviewRepository } from './review.repo';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  findAll(productId: number, query: ReviewListQuery) {
    return this.reviewRepository.findAll(productId, query);
  }

  async create(
    orderId: number,
    productId: number,
    userId: number,
    body: CreateReviewBody,
  ) {
    const purchase = await this.reviewRepository.findDeliveredPurchase(
      orderId,
      productId,
      userId,
    );

    if (!purchase) {
      throw new BadRequestException(
        'Only delivered products purchased by you can be reviewed',
      );
    }

    try {
      return await this.reviewRepository.create(
        orderId,
        productId,
        userId,
        body,
      );
    } catch (error) {
      if (isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
        throw new ConflictException(
          'This product has already been reviewed for this order',
        );
      }

      throw error;
    }
  }

  async update(reviewId: number, userId: number, body: UpdateReviewBody) {
    const review = await this.findOwnedReview(reviewId, userId);

    if (review.updateCount >= 1) {
      throw new BadRequestException('A review can only be edited once');
    }

    try {
      return await this.reviewRepository.update(reviewId, body);
    } catch (error) {
      if (error instanceof ReviewAlreadyUpdatedError) {
        throw new ConflictException(
          'Review was already edited; please reload the review',
        );
      }

      throw error;
    }
  }

  async delete(reviewId: number, userId: number) {
    await this.findOwnedReview(reviewId, userId);
    await this.reviewRepository.delete(reviewId);

    return { message: 'Review deleted successfully' };
  }

  private async findOwnedReview(reviewId: number, userId: number) {
    const review = await this.reviewRepository.findOwnedById(reviewId, userId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }
}
