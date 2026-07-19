import { UserStatus } from 'generated/prisma/client';
import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UpdateProfileBodySchema = z
  .object({
    name: z.string().min(1).max(500).optional(),
    phoneNumber: z.string().min(1).max(50).optional(),
    avatar: z.string().url().max(1000).nullable().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateProfileBody = z.infer<typeof UpdateProfileBodySchema>;
