import { OrderStatus, PaymentStatus } from '../../../../generated/prisma/enums';
import { z } from 'zod';

export const ReceiverSchema = z.object({
  name: z.string().trim().min(1).max(500),
  phoneNumber: z.string().trim().min(1).max(50),
  address: z.string().trim().min(1).max(1000),
});

export const CheckoutBodySchema = z
  .object({
    cartItemIds: z.array(z.number().int().positive()).min(1).max(100),
    receiver: ReceiverSchema,
  })
  .strict()
  .superRefine((body, context) => {
    if (new Set(body.cartItemIds).size !== body.cartItemIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['cartItemIds'],
        message: 'cartItemIds must not contain duplicate values',
      });
    }
  });

export const OrderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(OrderStatus).optional(),
});

export const UpdateOrderStatusBodySchema = z
  .object({
    status: z.enum(OrderStatus),
  })
  .strict();

const SnapshotTranslationSchema = z.object({
  languageId: z.string(),
  name: z.string(),
  description: z.string(),
});

export const OrderItemResponseSchema = z.object({
  id: z.number(),
  productName: z.string(),
  skuPrice: z.number(),
  image: z.string(),
  skuValue: z.string(),
  skuId: z.number().nullable(),
  orderId: z.number().nullable(),
  quantity: z.number(),
  productId: z.number().nullable(),
  productTranslations: z.array(SnapshotTranslationSchema),
  createdAt: z.date(),
  lineTotal: z.number(),
});

export const OrderResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  status: z.enum(OrderStatus),
  receiver: ReceiverSchema,
  shopId: z.number().nullable(),
  paymentId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  payment: z.object({
    id: z.number(),
    status: z.enum(PaymentStatus),
  }),
  shop: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable(),
  items: z.array(OrderItemResponseSchema),
  totalAmount: z.number().nonnegative(),
});

export const OrderListResponseSchema = z.object({
  data: z.array(OrderResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const CheckoutResponseSchema = z.object({
  paymentId: z.number(),
  orders: z.array(OrderResponseSchema),
});

export type CheckoutBody = z.infer<typeof CheckoutBodySchema>;
export type OrderListQuery = z.infer<typeof OrderListQuerySchema>;
export type UpdateOrderStatusBody = z.infer<typeof UpdateOrderStatusBodySchema>;
