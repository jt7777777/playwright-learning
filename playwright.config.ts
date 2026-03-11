import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Chýba env premenná: ${name}`);
  return value;
}

export const env = {
  get baseUrl() { return process.env.BASE_URL || 'http://localhost:3000'; },
  get userName() { return requireEnv('USER_NAME'); },
  get userPassword() { return requireEnv('USER_PASSWORD'); },
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: env.baseUrl,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Show browser window during tests */
    headless: true,

    /* Cypress RealWorld App uses data-test instead of data-testid */
    testIdAttribute: 'data-test',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup projekt — prihlási sa raz a uloží session
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Login a signup testy — bez session, bez závislosti na setup
    {
      name: 'login',
      testMatch: /login\.spec\.ts|signup\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Visual testy — Applitools, bez session
    {
      name: 'visual',
      testMatch: /visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Autentifikované testy — načíta uloženú session
    {
      name: 'chromium',
      testIgnore: /login\.spec\.ts|signup\.spec\.ts|visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'cd cypress-realworld-app && yarn start',
    // API beží na porte 3001 a štartuje neskôr ako frontend (3000).
    // Čakáme na 3001, aby boli oba servery ready pred testami.
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
