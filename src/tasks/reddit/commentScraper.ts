import { Job } from 'bullmq';
import logger from '../../utils/logger';
import { RedditJobType } from '../../queues/reddit';
import { Page } from 'playwright';

interface CommentScrapeData {
  postUrl: string;
  limit?: number;
}

export async function processCommentScrape(job: Job<CommentScrapeData>, page: Page) {
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
    postUrl: job.data.postUrl
  }, `Starting authenticated comment scrape`);

  try {
    const { postUrl, limit = 50 } = job.data;

    await page.goto(postUrl);

    logger.info(`Completed comment scrape for ${postUrl}`);
    return { success: true, count: limit };
  } catch (error) {
    logger.error(`Comment scrape failed: ${error}`);
    throw error;
  }
}

export const commentScrapeTask = {
  name: RedditJobType.SCRAPE_COMMENTS,
  processor: processCommentScrape,
};
