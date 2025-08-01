import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    trace: 'on-first-retry',
  },
  retries: 1,
  timeout: 10000,
});
