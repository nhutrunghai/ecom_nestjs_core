import { z } from 'zod';

export const AddCartItemBodySchema = z
  .object({
    skuId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
  })
  .strict();

export const UpdateCartItemBodySchema = z
  .object({
    quantity: z.number().int().min(1).max(99),
  })
  .strict();

const CartProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  images: z.array(z.string()),
  publishedAt: z.date().nullable(),
});

const CartSkuSchema = z.object({
  id: z.number(),
  value: z.string(),
  price: z.number(),
  stock: z.number(),
  image: z.string(),
  product: CartProductSchema,
});

export const CartItemResponseSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  skuId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  sku: CartSkuSchema,
  available: z.boolean(),
  lineTotal: z.number(),
});

export const CartResponseSchema = z.object({
  items: z.array(CartItemResponseSchema),
  totalItems: z.number().int().nonnegative(),
  subtotal: z.number().nonnegative(),
});

export const CartMutationResponseSchema = z.object({
  message: z.string(),
});

export type AddCartItemBody = z.infer<typeof AddCartItemBodySchema>;
export type UpdateCartItemBody = z.infer<typeof UpdateCartItemBodySchema>;
