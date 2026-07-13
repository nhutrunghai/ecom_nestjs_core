import { HTTPMethod } from 'generated/prisma/client';
import { z } from 'zod';

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(500),
  description: z.string().max(500).default(''),
  path: z.string().min(1).max(1000),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),
  module: z.string().max(500).default(''),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PermissionResponseSchema = PermissionSchema;

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
})
  .extend({
    description: z.string().max(500).optional(),
    module: z.string().max(500).optional(),
  })
  .strict();

export const UpdatePermissionBodySchema = PermissionSchema.pick({
  id: true,
  name: true,
  path: true,
  method: true,
})
  .extend({
    description: z.string().max(500).optional(),
    module: z.string().max(500).optional(),
  })
  .strict();

export const DeletePermissionResponseSchema = z.object({
  message: z.string(),
});

export type PermissionModel = z.infer<typeof PermissionSchema>;
export type PermissionResponse = z.infer<typeof PermissionResponseSchema>;
export type CreatePermissionBody = z.infer<typeof CreatePermissionBodySchema>;
export type UpdatePermissionBody = z.infer<typeof UpdatePermissionBodySchema>;
export type DeletePermissionResponse = z.infer<
  typeof DeletePermissionResponseSchema
>;
