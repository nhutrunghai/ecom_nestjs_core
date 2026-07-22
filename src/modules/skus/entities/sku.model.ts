import { z } from 'zod';

export const SkuWriteSchema = z.object({
  value: z.string().trim().min(1).max(500),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  image: z.string().url().max(1000),
});

export const CreateSkuBodySchema = SkuWriteSchema;

export const UpdateSkuBodySchema = SkuWriteSchema.partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  });

export const UpdateSkuStockBodySchema = z
  .object({
    stock: z.number().int().nonnegative(),
  })
  .strict();

export const SkuResponseSchema = SkuWriteSchema.extend({
  id: z.number().int().positive(),
  productId: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DeleteSkuResponseSchema = z.object({
  message: z.string(),
});

export type CreateSkuBody = z.infer<typeof CreateSkuBodySchema>;
export type UpdateSkuBody = z.infer<typeof UpdateSkuBodySchema>;
export type UpdateSkuStockBody = z.infer<typeof UpdateSkuStockBodySchema>;
