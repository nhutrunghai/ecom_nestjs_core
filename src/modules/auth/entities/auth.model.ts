import { UserStatus, VerificationCodeType } from 'generated/prisma/client';
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

export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

export const CreateDeviceSchema = DeviceSchema.pick({
  userId: true,
  userAgent: true,
  ip: true,
}).strict();

export const UpdateDeviceActivitySchema = DeviceSchema.pick({
  id: true,
  userAgent: true,
  ip: true,
  isActive: true,
}).strict();
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
    code: z.string().regex(/^\d{6}$/, { message: 'OTP code must be 6 digits' }),
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

export const ForgotPasswordBodySchema = z
  .object({
    email: z.string().email({ message: 'Email must be a valid email' }),
    code: z.string().regex(/^\d{6}$/, { message: 'OTP code must be 6 digits' }),
    newPassword: z
      .string()
      .min(8, { message: 'New password must be at least 8 characters' }),
    confirmNewPassword: z
      .string()
      .min(8, { message: 'Confirm new password is required' }),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmNewPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
});
export const LoginBodySchema = UserSchema.pick({
  email: true,
})
  .extend({
    password: z.string().min(1, { message: 'Password is required' }),
    code: z
      .string()
      .regex(/^\d{6}$/, { message: '2FA code must be 6 digits' })
      .optional(),
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

export const LogoutResponseSchema = z.object({
  message: z.string(),
});

export const Enable2FaResponseSchema = z.object({
  secret: z.string(),
  otpAuthUrl: z.string(),
  qrCodeUrl: z.string(),
});

export const Disable2FaBodySchema = z
  .object({
    code: z.string().regex(/^\d{6}$/, { message: '2FA code must be 6 digits' }),
  })
  .strict();

export const Disable2FaResponseSchema = z.object({
  message: z.string(),
});
export const SendOtpBodySchema = z
  .object({
    email: z.string().email({ message: 'Email must be a valid email' }),
    type: z.enum([
      VerificationCodeType.REGISTER,
      VerificationCodeType.FORGOT_PASSWORD,
      VerificationCodeType.LOGIN,
      VerificationCodeType.DISABLE_2FA,
    ]),
  })
  .strict();

export const SendOtpResponseSchema = z.object({
  message: z.string(),
});

export type UserModel = z.infer<typeof UserSchema>;

export type UserResponse = z.infer<typeof UserResponseSchema>;

export type DeviceModel = z.infer<typeof DeviceSchema>;

export type CreateDeviceData = z.infer<typeof CreateDeviceSchema>;

export type UpdateDeviceActivityData = z.infer<
  typeof UpdateDeviceActivitySchema
>;

export type RegisterBody = z.infer<typeof RegisterBodySchema>;

export type ForgotPasswordBody = z.infer<typeof ForgotPasswordBodySchema>;

export type ForgotPasswordResponse = z.infer<
  typeof ForgotPasswordResponseSchema
>;

export type LoginBody = z.infer<typeof LoginBodySchema>;

export type AuthTokens = z.infer<typeof AuthTokenSchema>;

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export type RefreshTokenBody = z.infer<typeof RefreshTokenBodySchema>;

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

export type Enable2FaResponse = z.infer<typeof Enable2FaResponseSchema>;

export type Disable2FaBody = z.infer<typeof Disable2FaBodySchema>;

export type Disable2FaResponse = z.infer<typeof Disable2FaResponseSchema>;

export type SendOtpBody = z.infer<typeof SendOtpBodySchema>;

export type SendOtpResponse = z.infer<typeof SendOtpResponseSchema>;
