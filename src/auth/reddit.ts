import { BrowserContext, Page } from '@playwright/test';
import logger from '../utils/logger';
import { TOTP } from 'totp-generator';

const LOGIN_URL = 'https://old.reddit.com/login';
const SELECTORS = {
  usernameInput: 'faceplate-text-input[name="username"]',
  passwordInput: 'faceplate-text-input[name="password"]',
  loginButton: 'button.login',
  twoFactorInput: 'input[name="otp"]',
  userMenu: '[data-testid="user-avatar"]',
  authFlowModal: 'auth-flow-modal',
  loginForm: 'faceplate-form[id="login"]',
  loginFormOtp: 'faceplate-form[id="login-app-otp"]',
  loginTab: 'faceplate-tabpanel[pagenames="login_username_and_password,login_otp_app,login_otp_backup"]'
};

export class RedditAuth {
  static async login(
    page: Page,
    credentials: {
      username: string
      password: string
      twoFactorSecret?: string | undefined
    }
  ): Promise<void> {
    await page.goto(LOGIN_URL);
    logger.info('Navigated to Reddit login page');

    await page.textContent('shreddit-app:has(auth-flow-manager)');

    logger.debug('shreddit-app loaded');

    await page.locator(SELECTORS.usernameInput).click({ delay: 150 });
    await page.keyboard.type(credentials.username);

    await page.locator(SELECTORS.passwordInput).click();
    await page.keyboard.type(credentials.password, { delay: 150 });
    logger.info('Filled login credentials');

    await page.locator(SELECTORS.loginButton).click({ timeout: 1000 });
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
