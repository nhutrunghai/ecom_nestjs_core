import { z } from 'zod';

export const CategoryResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string().nullable(),
  parentCategoryId: z.number().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCategoryBodySchema = z
  .object({
    name: z.string().min(1).max(500),
    logo: z.string().url().max(1000).nullable().optional(),
    parentCategoryId: z.number().int().positive().nullable().optional(),
  })
  .strict();

export const UpdateCategoryBodySchema = CreateCategoryBodySchema.partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  });

export const DeleteCategoryResponseSchema = z.object({
  message: z.string(),
});

export type CreateCategoryBody = z.infer<typeof CreateCategoryBodySchema>;
export type UpdateCategoryBody = z.infer<typeof UpdateCategoryBodySchema>;
