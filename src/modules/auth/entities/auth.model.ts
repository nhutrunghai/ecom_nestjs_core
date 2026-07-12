import { UserStatus } from 'generated/prisma/client';
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  phoneNumber: z.string(),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export const RegisterBodySchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z
      .string()
      .min(8, { message: 'Confirm password is required' }),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export const LoginBodySchema = UserSchema.pick({
  email: true,
})
  .extend({
    password: z.string().min(1, { message: 'Password is required' }),
  })
  .strict();

export const AuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const LoginResponseSchema = AuthTokenSchema.extend({
  user: UserResponseSchema,
});

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
  })
  .strict();

export const RefreshTokenResponseSchema = AuthTokenSchema;

export type UserModel = z.infer<typeof UserSchema>;

export type UserResponse = z.infer<typeof UserResponseSchema>;

export type RegisterBody = z.infer<typeof RegisterBodySchema>;

export type LoginBody = z.infer<typeof LoginBodySchema>;

export type AuthTokens = z.infer<typeof AuthTokenSchema>;

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export type RefreshTokenBody = z.infer<typeof RefreshTokenBodySchema>;

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
