import { BrowserContext, Page } from '@playwright/test';
import logger from '../utils/logger';
import { TOTP } from 'totp-generator';

const LOGIN_URL = 'https://old.reddit.com/login';
const SELECTORS = {
  usernameInput: '#login-username',
  passwordInput: '#login-password',
  loginButton: 'button.login',
  twoFactorInput: '#one-time-code-appOtp',
  userMenu: '[data-testid="user-avatar"]',
  authFlowManager: 'auth-flow-manager',
  loginForm: 'faceplate-form[id="login"]',
  loginTab: 'faceplate-tabpanel[pagenames="login_username_and_password"]'
};

export class RedditAuth {
  static async login(
    context: BrowserContext,
    credentials: {
      username: string
      password: string
      twoFactorSecret?: string | undefined
    }
  ): Promise<void> {
    const page = await context.newPage();
    await page.goto(LOGIN_URL);
    logger.info('Navigated to Reddit login page');

    await page.waitForSelector('shreddit-app', { state: 'attached' });
    logger.debug('shreddit-app loaded');

    await page.waitForSelector(SELECTORS.authFlowManager, {
      state: 'visible',
      timeout: 15000
    });
    logger.debug('auth-flow-manager loaded');

    await page.waitForSelector(SELECTORS.loginForm, {
      state: 'visible',
      timeout: 10000
    });
    logger.debug('login form loaded');

    await Promise.all([
      page.waitForSelector(SELECTORS.usernameInput, { state: 'attached' }),
      page.waitForSelector(SELECTORS.passwordInput, { state: 'attached' })
    ]);

    await page.locator(SELECTORS.usernameInput).fill(credentials.username, { timeout: 5000 });
    await page.locator(SELECTORS.passwordInput).fill(credentials.password, { timeout: 5000 });
    logger.debug('Filled login credentials');

    const loginButton = page.locator(SELECTORS.loginButton);
    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click({ timeout: 5000 });
    logger.debug('Submitted login form');

    await Promise.race([
      page.waitForSelector(SELECTORS.userMenu, { timeout: 10000 }),
      page.waitForSelector(SELECTORS.twoFactorInput, { timeout: 10000 })
    ]);

    if (await page.isVisible(SELECTORS.twoFactorInput)) {
      if (!credentials.twoFactorSecret) {
        throw new Error('2FA required but no code provided');
      }

      const { otp, expires } = TOTP.generate(credentials.twoFactorSecret);
      await page.locator(SELECTORS.twoFactorInput).fill(otp, { timeout: 5000 });
      await page.locator('button.check-app-code').click({ timeout: 5000 });
      logger.info('Submitted 2FA code');

      await page.waitForSelector(SELECTORS.userMenu, { timeout: 15000 });
    }

    await page.waitForSelector(SELECTORS.userMenu, { timeout: 15000 });
    logger.info(`Successfully logged in as ${credentials.username}`);

    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      throw new Error('Login may have failed - still on login page');
    }
  }
}
