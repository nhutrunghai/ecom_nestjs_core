import { z } from 'zod';

export const ProductVariantSchema = z.object({
  name: z.string().min(1).max(100),
  options: z.array(z.string().min(1).max(100)).min(1),
});

export const ProductTranslationInputSchema = z.object({
  languageId: z.string().min(1).max(10),
  name: z.string().min(1).max(500),
  description: z.string(),
});

export const ProductSkuInputSchema = z.object({
  id: z.number().int().positive().optional(),
  value: z.string().min(1).max(500),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  image: z.string().url().max(1000),
});

const ProductWriteSchema = z.object({
  name: z.string().min(1).max(500),
  basePrice: z.number().nonnegative(),
  virtualPrice: z.number().nonnegative(),
  brandId: z.number().int().positive(),
  publishedAt: z.coerce.date().nullable().optional(),
  images: z.array(z.string().url().max(1000)).min(1),
  variants: z.array(ProductVariantSchema),
  categoryIds: z.array(z.number().int().positive()).min(1),
  skus: z.array(ProductSkuInputSchema).min(1),
  translations: z.array(ProductTranslationInputSchema),
});

export const CreateProductBodySchema = ProductWriteSchema.extend({
  translations: z.array(ProductTranslationInputSchema).default([]),
}).superRefine((body, context) => {
  if (body.virtualPrice < body.basePrice) {
    context.addIssue({
      code: 'custom',
      path: ['virtualPrice'],
      message: 'Virtual price must be greater than or equal to base price',
    });
  }

  addDuplicateIssues(body.categoryIds, 'categoryIds', context);
  addDuplicateIssues(
    body.translations.map((translation) => translation.languageId),
    'translations',
    context,
  );
  addDuplicateIssues(
    body.skus.map((sku) => sku.value),
    'skus',
    context,
  );
});

export const UpdateProductBodySchema = ProductWriteSchema.partial()
  .strict()
  .superRefine((body, context) => {
    if (Object.keys(body).length === 0) {
      context.addIssue({
        code: 'custom',
        message: 'At least one field must be provided',
      });
    }

    if (
      body.basePrice !== undefined &&
      body.virtualPrice !== undefined &&
      body.virtualPrice < body.basePrice
    ) {
      context.addIssue({
        code: 'custom',
        path: ['virtualPrice'],
        message: 'Virtual price must be greater than or equal to base price',
      });
    }

    if (body.categoryIds) {
      addDuplicateIssues(body.categoryIds, 'categoryIds', context);
    }

    if (body.translations) {
      addDuplicateIssues(
        body.translations.map((translation) => translation.languageId),
        'translations',
        context,
      );
    }

    if (body.skus) {
      addDuplicateIssues(
        body.skus.map((sku) => sku.value),
        'skus',
        context,
      );

      const existingIds = body.skus
        .map((sku) => sku.id)
        .filter((id): id is number => id !== undefined);
      addDuplicateIssues(existingIds, 'skus', context);
    }
  });

export const ProductListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(500).optional(),
  brandId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
});

export const ProductCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string().nullable(),
});

export const ProductBrandSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string(),
});

export const ProductSkuResponseSchema = ProductSkuInputSchema.required().extend(
  {
    productId: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
  },
);

export const ProductTranslationResponseSchema =
  ProductTranslationInputSchema.extend({
    id: z.number(),
    productId: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export const ProductResponseSchema = z.object({
  id: z.number(),
  publishedAt: z.date().nullable(),
  name: z.string(),
  basePrice: z.number(),
  virtualPrice: z.number(),
  brandId: z.number(),
  images: z.array(z.string()),
  variants: z.array(ProductVariantSchema),
  createdById: z.number(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  brand: ProductBrandSchema,
  categories: z.array(ProductCategorySchema),
  skus: z.array(ProductSkuResponseSchema),
  productTranslations: z.array(ProductTranslationResponseSchema),
});

export const ProductListResponseSchema = z.object({
  data: z.array(ProductResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const DeleteProductResponseSchema = z.object({
  message: z.string(),
});

function addDuplicateIssues(
  values: Array<string | number>,
  path: string,
  context: z.RefinementCtx,
) {
  if (new Set(values).size !== values.length) {
    context.addIssue({
      code: 'custom',
      path: [path],
      message: `${path} must not contain duplicate values`,
    });
  }
}

export type CreateProductBody = z.infer<typeof CreateProductBodySchema>;
export type UpdateProductBody = z.infer<typeof UpdateProductBodySchema>;
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;
