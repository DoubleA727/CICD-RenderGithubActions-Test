// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const envFile =
  process.env.ENV_FILE ||
  (process.env.CI ? '.env.test' : '.env.development');

dotenv.config({
  path: path.resolve(process.cwd(), envFile),
});

export default defineConfig({
  testDir: './playwright-tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL:
      process.env.BASE_URL ||
      `http://localhost:${process.env.PORT || 3001}`,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
