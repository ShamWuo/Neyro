import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(16).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  GAI_API_KEY: z.string().min(1).optional(),
  REDIS_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let _env: Env | null = null;

export function validateEnv(): Env {
  if (_env) return _env;

  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    // Print helpful diagnostics and fail fast
    // eslint-disable-next-line no-console
    console.error("Environment validation failed:\n", result.error.format());
    throw new Error("Invalid environment configuration. See logs for details.");
  }

  _env = result.data;
  return _env;
}

export const env = validateEnv();
