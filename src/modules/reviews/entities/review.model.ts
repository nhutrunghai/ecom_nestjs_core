import { MediaType } from '../../../../generated/prisma/enums';
import { z } from 'zod';

export const ReviewMediaInputSchema = z.object({
  url: z.string().url().max(1000),
  type: z.enum(MediaType),
});

const ReviewWriteSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  rating: z.number().int().min(1).max(5),
  medias: z.array(ReviewMediaInputSchema).max(10),
});

export const CreateReviewBodySchema = ReviewWriteSchema.extend({
  medias: z.array(ReviewMediaInputSchema).max(10).default([]),
}).strict();

export const UpdateReviewBodySchema = ReviewWriteSchema.partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  });

export const ReviewListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export const ReviewResponseSchema = z.object({
  id: z.number(),
  content: z.string(),
  rating: z.number(),
  orderId: z.number(),
  productId: z.number(),
  userId: z.number(),
  updateCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    avatar: z.string().nullable(),
  }),
  medias: z.array(
    z.object({
      id: z.number(),
      url: z.string(),
      type: z.enum(MediaType),
      createdAt: z.date(),
    }),
  ),
});

export const ReviewListResponseSchema = z.object({
  data: z.array(ReviewResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const DeleteReviewResponseSchema = z.object({
  message: z.string(),
});

export type CreateReviewBody = z.infer<typeof CreateReviewBodySchema>;
export type UpdateReviewBody = z.infer<typeof UpdateReviewBodySchema>;
export type ReviewListQuery = z.infer<typeof ReviewListQuerySchema>;
