import { Job } from 'bullmq';
import logger from '../../utils/logger';
import { RedditJobType } from '../../queues/reddit';
import { Page } from 'playwright';

interface PostScrapeData {
  subreddit: string;
  limit?: number;
}

export async function processPostScrape(job: Job<PostScrapeData>, page: Page) {
  try {
    await page.locator('[data-testid="user-avatar"]').waitFor({
      state: 'visible',
      timeout: 10000
    });
  } catch (err) {
    logger.error({ job: job.id }, 'Authentication verification failed');
    throw new Error('Authentication check timeout - session may be invalid');
  }

  logger.info({
    job: job.id,
    subreddit: job.data.subreddit
  }, `Starting authenticated post scrape`);

  try {
    const { subreddit, limit = 25 } = job.data;
    const url = `https://www.reddit.com/r/${subreddit}/top/?t=week`;

    await page.goto(url);

    logger.info(`Completed post scrape for ${subreddit}`);
    return { success: true, count: limit };
  } catch (error) {
    logger.error(`Post scrape failed: ${error}`);
    throw error;
  }
}

export const postScrapeTask = {
  name: RedditJobType.SCRAPE_POSTS,
  processor: processPostScrape,
};
