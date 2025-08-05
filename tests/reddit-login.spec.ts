import { test, expect } from '@playwright/test';
import { RedditAuth } from '../src/auth/reddit';
import { createSession, closeSession } from '../src/utils/sessionManager';
import logger from '../src/utils/logger';
import { config } from '../src/config/env';

test.describe('Reddit Login', () => {
  let sessionId: string;

  test.beforeEach(async () => {
    sessionId = Math.random().toString(36).substring(2, 15);
  });

  test.afterEach(async () => {
    await closeSession(sessionId);
  });

  test('should login successfully', async ({ page }) => {
    const context = await createSession(
      config.PROXY_CHAIN_ENABLED === 'true' ? config.PROXY_URL : undefined
    );

    await RedditAuth.login(page, {
      username: config.REDDIT_USERNAME,
      password: config.REDDIT_PASSWORD,
      twoFactorSecret: config.REDDIT_OTP_SECRET
    });

    // Verify successful login
    const usernameDisplay = await page.textContent('#header-bottom-right .user a');
    expect(usernameDisplay).toContain(config.REDDIT_USERNAME);
    logger.info(`Verified login as ${config.REDDIT_USERNAME} in session ${sessionId}`);
  });
});
