import { z } from 'zod';

export const BrandResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateBrandBodySchema = z
  .object({
    name: z.string().min(1).max(500),
    logo: z.string().url().max(1000),
  })
  .strict();

export const UpdateBrandBodySchema = CreateBrandBodySchema.partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  });

export const DeleteBrandResponseSchema = z.object({
  message: z.string(),
});

export type CreateBrandBody = z.infer<typeof CreateBrandBodySchema>;
export type UpdateBrandBody = z.infer<typeof UpdateBrandBodySchema>;
