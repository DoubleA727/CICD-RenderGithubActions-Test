// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '../tests',

  // IMPORTANT: avoid Playwright trying to delete locked "test-results" on Windows/OneDrive
  outputDir: '../pw-output',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1, // use 1 locally to reduce file locking; change to undefined if you want parallel locally

  /* Reporter to use */
  reporter: 'list',

  use: {
    // So you can do: await page.goto('/login.html')
    baseURL: 'http://127.0.0.1:3001',

    // Reduce files created (OneDrive locks these a lot)
    trace: process.env.CI ? 'on-first-retry' : 'off',
    screenshot: process.env.CI ? 'only-on-failure' : 'off',
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Best practice: DO NOT use nodemon for Playwright runs.
    // Create this script in package.json:
    // "start:testserver": "dotenv -e .env.test -- node ./src/server.js"
    command: 'npm run start:testserver',

    url: 'http://127.0.0.1:3001',

    // In local dev, reuse server if already running.
    // On CI, set CI=true so it doesn't reuse.
    reuseExistingServer: !process.env.CI,

    // Give it a bit more time if your server/migrations are slow on Windows
    timeout: 120 * 1000,
  },

  globalSetup: require.resolve('./playwright-global-setup'),
});
