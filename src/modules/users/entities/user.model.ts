import { UserStatus } from 'generated/prisma/client';
import { z } from 'zod';

export const UserRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
});

export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number(),
  role: UserRoleSchema,
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserBodySchema = z
  .object({
    email: z.string().email().max(500),
    name: z.string().min(1).max(500),
    password: z.string().min(8).max(500),
    phoneNumber: z.string().min(1).max(50),
    avatar: z.string().url().max(1000).nullable().optional(),
    status: z
      .enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED])
      .optional(),
    roleId: z.number().int().positive(),
  })
  .strict();

export const UpdateUserBodySchema = z
  .object({
    email: z.string().email().max(500).optional(),
    name: z.string().min(1).max(500).optional(),
    password: z.string().min(8).max(500).optional(),
    phoneNumber: z.string().min(1).max(50).optional(),
    avatar: z.string().url().max(1000).nullable().optional(),
    status: z
      .enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED])
      .optional(),
    roleId: z.number().int().positive().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  });

export const DeleteUserResponseSchema = z.object({
  message: z.string(),
});

export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
