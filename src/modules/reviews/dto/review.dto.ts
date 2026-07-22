import { createZodDto } from 'nestjs-zod';
import {
  CreateReviewBodySchema,
  DeleteReviewResponseSchema,
  ReviewListQuerySchema,
  ReviewListResponseSchema,
  ReviewResponseSchema,
  UpdateReviewBodySchema,
} from '../entities/review.model';

export class CreateReviewDto extends createZodDto(CreateReviewBodySchema) {}

export class UpdateReviewDto extends createZodDto(UpdateReviewBodySchema) {}

export class ReviewListQueryDto extends createZodDto(ReviewListQuerySchema) {}

export class ReviewResponseDto extends createZodDto(ReviewResponseSchema) {}

export class ReviewListResponseDto extends createZodDto(
  ReviewListResponseSchema,
) {}

export class DeleteReviewResponseDto extends createZodDto(
  DeleteReviewResponseSchema,
) {}
