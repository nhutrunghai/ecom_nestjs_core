import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { UserStatus } from 'generated/prisma/client';
const UserReponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export class UserResponseDto extends createZodDto(UserReponseSchema) {}
const registerDtoSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Email must be a valid email' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Confirm password is required' }),
    phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
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
 export type RegisterBody = z.infer<typeof registerDtoSchema>;
export class RegisterDto extends createZodDto(registerDtoSchema) {}
