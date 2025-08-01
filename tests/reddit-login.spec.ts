import { test, expect } from '@playwright/test';
import { RedditAuth } from '../src/auth/reddit';
import { createSession, closeSession } from '../src/utils/sessionManager';
import logger from '../src/utils/logger';

test.describe('Reddit Login', () => {
  let username: string;
  let password: string;
  let sessionId: string;

  test.beforeAll(() => {
    username = process.env.REDDIT_USERNAME || '';
    password = process.env.REDDIT_PASSWORD || '';

    if (!username || !password) {
      const errorMsg = 'REDDIT_USERNAME and REDDIT_PASSWORD environment variables must be set';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  });

  test.beforeEach(async () => {
    sessionId = Math.random().toString(36).substring(2, 15);
  });

  test.afterEach(async () => {
    await closeSession(sessionId);
  });

  test('should login successfully', async ({ page }) => {
    const context = await createSession(process.env.PROXY_URL);

    await RedditAuth.login(context, {
      username,
      password,
      twoFactorSecret: process.env.REDDIT_OTP_SECRET || undefined
    });

    // Verify successful login
    const usernameDisplay = await page.textContent('#header-bottom-right .user a');
    expect(usernameDisplay).toContain(username);
    logger.info(`Verified login as ${username} in session ${sessionId}`);
  });
});
