import { Page } from '@playwright/test';
import logger from '../utils/logger';

const LOGIN_URL = 'https://old.reddit.com/login/?dest=https%3A%2F%2Fold.reddit.com%2F';
const SELECTORS = {
  usernameInput: 'input[name="user"]',
  passwordInput: 'input[name="passwd"]',
  loginButton: 'button[type="submit"]',
  twoFactorInput: 'input[name="otp"]',
  userMenu: '#header-bottom-right .user a'
};

export class RedditAuth {
  static async login(
    page: Page,
    credentials: {
      username: string
      password: string
      twoFactorCode?: string | undefined
    }
  ): Promise<void> {
    await page.goto(LOGIN_URL);
    logger.info('Navigated to Reddit login page');

    await page.fill(SELECTORS.usernameInput, credentials.username);
    await page.fill(SELECTORS.passwordInput, credentials.password);
    logger.debug('Filled login credentials');

    await page.click(SELECTORS.loginButton);
    logger.debug('Submitted login form');

    if (credentials.twoFactorCode) {
      await page.waitForSelector(SELECTORS.twoFactorInput);
      await page.fill(SELECTORS.twoFactorInput, credentials.twoFactorCode);
      await page.click(SELECTORS.loginButton);
      logger.info('Submitted 2FA code');
    }

    await page.waitForSelector(SELECTORS.userMenu);
    logger.info(`Successfully logged in as ${credentials.username}`);
  }
}
