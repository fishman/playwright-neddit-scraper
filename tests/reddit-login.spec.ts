import { test, expect } from '@playwright/test';
import { RedditAuth } from '../src/auth/reddit';
import logger from '../src/utils/logger';

test.describe('Reddit Login', () => {
  let username: string;
  let password: string;

  test.beforeAll(() => {
    username = process.env.REDDIT_USERNAME || '';
    password = process.env.REDDIT_PASSWORD || '';

    if (!username || !password) {
      const errorMsg = 'REDDIT_USERNAME and REDDIT_PASSWORD environment variables must be set';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  });

  test('should login successfully', async ({ page }) => {
    await RedditAuth.login(page, {
      username,
      password,
      twoFactorCode: process.env.REDDIT_2FA_CODE || undefined
    });

    // Verify successful login
    const usernameDisplay = await page.textContent('#header-bottom-right .user a');
    expect(usernameDisplay).toContain(username);
    logger.info(`Verified login as ${username}`);
  });
});
