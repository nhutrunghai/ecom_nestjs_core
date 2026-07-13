import { z } from 'zod';

export const LanguageSchema = z.object({
  id: z
    .string()
    .min(1, { message: 'Language id is required' })
    .max(10, { message: 'Language id must be at most 10 characters' }),
  name: z
    .string()
    .min(1, { message: 'Language name is required' })
    .max(500, { message: 'Language name must be at most 500 characters' }),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LanguageResponseSchema = LanguageSchema;

export const LanguageListResponseSchema = z.array(LanguageResponseSchema);

export const CreateLanguageBodySchema = LanguageSchema.pick({
  id: true,
  name: true,
}).strict();

export const UpdateLanguageBodySchema = LanguageSchema.pick({
  id: true,
  name: true,
}).strict();

export const DeleteLanguageResponseSchema = z.object({
  message: z.string(),
});

export type LanguageModel = z.infer<typeof LanguageSchema>;

export type LanguageResponse = z.infer<typeof LanguageResponseSchema>;

export type LanguageListResponse = z.infer<typeof LanguageListResponseSchema>;

export type CreateLanguageBody = z.infer<typeof CreateLanguageBodySchema>;

export type UpdateLanguageBody = z.infer<typeof UpdateLanguageBodySchema>;

export type DeleteLanguageResponse = z.infer<
  typeof DeleteLanguageResponseSchema
>;
