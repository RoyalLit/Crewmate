/**
 * Environment variable validation and typed configuration.
 *
 * This module reads process.env at startup and validates it against a Zod
 * schema. The server will refuse to start with an incomplete or invalid
 * configuration.
 *
 * All application code must import config from this module — never
 * access process.env directly elsewhere.
 */

import { z } from 'zod';

const rawEnvSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z
    .string()
    .url()
    .refine(
      (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
      { message: 'MONGO_URI must start with mongodb:// or mongodb+srv://' },
    ),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_USER: z.string().default(''),
  EMAIL_PASS: z.string().default(''),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLIENT_URL: z.string().default('*'),
  MAGIC_OTP_ENABLED: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true')
    .refine((val) => {
      if (val && process.env.NODE_ENV === 'production') return false;
      return true;
    }, { message: 'MAGIC_OTP_ENABLED cannot be true in production' }),
  CRON_ENABLED: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true'),
  SENTRY_DSN: z.string().optional().default(''),
});

type RawEnv = z.infer<typeof rawEnvSchema>;

// Validate and build config on module load. Zod throws a comprehensive error
// listing every invalid/missing field — fail fast before the server starts.
const parsed: RawEnv = rawEnvSchema.parse(process.env);

interface Config {
  readonly port: number;
  readonly nodeEnv: 'development' | 'production' | 'test';
  readonly mongoUri: string;
  readonly accessTokenSecret: string;
  readonly refreshTokenSecret: string;
  readonly email: {
    readonly host: string;
    readonly port: number;
    readonly user: string;
    readonly pass: string;
  };
  readonly cloudinary: {
    readonly cloudName: string;
    readonly apiKey: string;
    readonly apiSecret: string;
  };
  readonly clientUrl: string;
  readonly magicOtpEnabled: boolean;
  readonly cronEnabled: boolean;
  readonly sentryDsn: string;
}

const env: Config = Object.freeze({
  port: parsed.PORT,
  nodeEnv: parsed.NODE_ENV,
  mongoUri: parsed.MONGO_URI,
  accessTokenSecret: parsed.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: parsed.REFRESH_TOKEN_SECRET,
  email: {
    host: parsed.EMAIL_HOST,
    port: parsed.EMAIL_PORT,
    user: parsed.EMAIL_USER,
    pass: parsed.EMAIL_PASS,
  },
  cloudinary: {
    cloudName: parsed.CLOUDINARY_CLOUD_NAME,
    apiKey: parsed.CLOUDINARY_API_KEY,
    apiSecret: parsed.CLOUDINARY_API_SECRET,
  },
  clientUrl: parsed.CLIENT_URL,
  magicOtpEnabled: parsed.MAGIC_OTP_ENABLED,
  cronEnabled: parsed.CRON_ENABLED,
  sentryDsn: parsed.SENTRY_DSN,
});

export default env;
