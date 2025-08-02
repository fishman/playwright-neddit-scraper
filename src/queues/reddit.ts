import { Queue, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import logger from '../utils/logger';

export const redditQueue = new Queue('reddit-scraping', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000, // Longer delay for auth retries
    },
    removeOnComplete: true,
    removeOnFail: {
      count: 100,
      age: 24 * 3600 // Keep failures for 24 hours
    },
  },
});

logger.info('Reddit scraping queue initialized');

export enum RedditJobType {
  SCRAPE_POSTS = 'scrape-posts',
  SCRAPE_COMMENTS = 'scrape-comments',
}
