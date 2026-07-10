import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce
    .number()
    .min(1, { message: 'PORT must be greater than 0' })
    .max(65535, { message: 'PORT must be less than or equal to 65535' })
    .default(3000),
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL is required' }),
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
