import { z } from 'zod';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const configSchema = z.object({
  REDDIT_USERNAME: z.string().min(1),
  REDDIT_PASSWORD: z.string().min(1),
  REDDIT_OTP_SECRET: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  HEADLESS: z.string().default('true'),
  PROXY_CHAIN_ENABLED: z.string().default('false'),
  PROXY_URL: z.string().optional(),
});

export type AppConfig = z.infer<typeof configSchema>;

let config: AppConfig;

try {
  config = configSchema.parse(process.env);
  logger.info('Configuration validated successfully');
} catch (err) {
  if (err instanceof z.ZodError) {
    logger.error({ 
      issues: err.issues,
      formatted: err.format() 
    }, 'Invalid configuration');
  }
  process.exit(1);
}

export { config };
