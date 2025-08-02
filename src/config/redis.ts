import { RedisOptions } from 'ioredis';
import logger from '../utils/logger';

export const redisConnection: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 5000);
    logger.warn(`Redis connection attempt ${times}, retrying in ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
};

logger.info('Redis connection configured');
