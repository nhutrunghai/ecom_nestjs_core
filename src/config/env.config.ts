import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce
    .number()
    .min(1, { message: 'PORT must be greater than 0' })
    .max(65535, { message: 'PORT must be less than or equal to 65535' })
    .default(3000),
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL is required' }),
  ADMIN_EMAIL: z.email({ message: 'ADMIN_EMAIL must be a valid email' }),
  ADMIN_NAME: z.string().min(1, { message: 'ADMIN_NAME is required' }),
  ADMIN_PASSWORD: z
    .string()
    .min(8, { message: 'ADMIN_PASSWORD must be at least 8 characters' }),
  ADMIN_PHONE_NUMBER: z
    .string()
    .min(1, { message: 'ADMIN_PHONE_NUMBER is required' }),
});

type EnvSchema = z.infer<typeof envSchema>;

export function validateEnv(envConfig: Record<string, unknown>): EnvSchema {
  const result = envSchema.safeParse(envConfig);

  if (!result.success) {
    console.error('Invalid environment variables:\n', result.error.format());
    throw new Error('Invalid environment variables');
  }

  return result.data;
}
