import { RedisOptions } from 'ioredis';
import logger from '../utils/logger';
import { config } from './env';

const redisConnection: RedisOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  ...(config.REDIS_PASSWORD ? { password: config.REDIS_PASSWORD } : {}),
  db: config.REDIS_DB,
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 5000);
    logger.warn(`Redis connection attempt ${times}, retrying in ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
};

logger.info('Redis connection configured');

export { redisConnection };
