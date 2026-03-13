import { test as setup } from '@playwright/test';
import { env } from '../playwright.config';
import { SigninPage } from './pages/signin.page';

const authFile = 'playwright/.auth/user.json';

setup('prihlásenie a uloženie session', async ({ page }) => {
  const signinPage = new SigninPage(page);

  await signinPage.goto();
  await signinPage.login(env.userName, env.userPassword);

  await page.waitForURL('/');

  // Uloží cookies + localStorage do súboru
  await page.context().storageState({ path: authFile });
});
