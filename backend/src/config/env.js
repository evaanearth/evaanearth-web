import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().min(1).default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().default(30),
  COOKIE_SECURE: z.string().default('false'),
  TRUST_PROXY: z.string().default('false'),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
  SMTP_HOST: z.string().optional().default(''), SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.string().default('false'), SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''), MAIL_FROM: z.string().default('Evaan Earth <hello@evaanearth.in>'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''), CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''), REDIS_URL: z.string().optional().default(''),
  SEED_SELLER_EMAIL: z.string().optional().default(''), SEED_SELLER_PASSWORD: z.string().optional().default('')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
