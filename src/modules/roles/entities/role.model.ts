import { HTTPMethod } from 'generated/prisma/client';
import { z } from 'zod';

export const RolePermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  path: z.string(),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),
  module: z.string(),
});

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(500),
  description: z.string().max(500).default(''),
  isActive: z.boolean(),
  permissions: z.array(RolePermissionSchema).optional(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RoleResponseSchema = RoleSchema;

export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
})
  .extend({
    description: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
    permissionIds: z.array(z.number().int().positive()).default([]),
  })
  .strict();

export const UpdateRoleBodySchema = RoleSchema.pick({
  id: true,
  name: true,
})
  .extend({
    description: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
    permissionIds: z.array(z.number().int().positive()).default([]),
  })
  .strict();

export const DeleteRoleResponseSchema = z.object({
  message: z.string(),
});

export type RoleModel = z.infer<typeof RoleSchema>;
export type RoleResponse = z.infer<typeof RoleResponseSchema>;
export type CreateRoleBody = z.infer<typeof CreateRoleBodySchema>;
export type UpdateRoleBody = z.infer<typeof UpdateRoleBodySchema>;
export type DeleteRoleResponse = z.infer<typeof DeleteRoleResponseSchema>;
