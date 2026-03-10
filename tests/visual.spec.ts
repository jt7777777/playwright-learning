import { test } from '@playwright/test';
import { Eyes, Target, BatchInfo, Configuration } from '@applitools/eyes-playwright';
import { env } from '../playwright.config';

const batch = new BatchInfo({ name: 'Playwright Learning – Visual Tests' });

let eyes: Eyes;

test.describe('Visual Tests – Login', () => {
  test.beforeEach(async ({ page }) => {
    eyes = new Eyes();

    const config = new Configuration();
    config.setApiKey(process.env.APPLITOOLS_API_KEY!);
    config.setBatch(batch);
    eyes.setConfiguration(config);

    await eyes.open(page, 'Cypress RealWorld App', test.info().title, {
      width: 1280,
      height: 720,
    });

    await page.goto('/signin');
  });

  test.afterEach(async () => {
    if (!eyes) return;

    try {
      if (eyes.getIsOpen()) {
        await eyes.close();
      }
    } finally {
      await eyes.abort();
    }
  });

  // Stav 1: prázdny formulár — zachytí default layout
  test('login stránka – default stav', async () => {
    await eyes.check('Login page – default', Target.window().fully());
  });

  // Stav 2: error stav — iný vizuálny stav, iné farby, error správa
  test('login stránka – error stav po zlom hesle', async ({ page }) => {
    await page.locator('#username').fill(env.userName);
    await page.locator('#password').fill('zle_heslo');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByText(/username or password is invalid/i).waitFor();

    await eyes.check('Login page – error state', Target.window().fully());
  });
});
