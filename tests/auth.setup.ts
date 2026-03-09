import { test as setup } from '@playwright/test';
import { env } from '../playwright.config';

const authFile = 'playwright/.auth/user.json';

setup('prihlásenie a uloženie session', async ({ page }) => {
  await page.goto('/signin');

  await page.locator('#username').fill(env.userName);
  await page.locator('#password').fill(env.userPassword);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('/');

  // Uloží cookies + localStorage do súboru
  await page.context().storageState({ path: authFile });
});
