import { test } from '@playwright/test';
import { env } from '../playwright.config';
import { HomePage } from './pages/home.page';
import { SigninPage } from './pages/signin.page';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await new SigninPage(page).goto();
  });

  test('zobrazí login formulár', async ({ page }) => {
    const signinPage = new SigninPage(page);

    await signinPage.expectLoaded();
  });

  test('úspešné prihlásenie so správnymi údajmi', async ({ page }) => {
    const signinPage = new SigninPage(page);
    const homePage = new HomePage(page);

    await signinPage.login(env.userName, env.userPassword);
    await homePage.expectSignedIn();
  });

  test('neúspešné prihlásenie so zlým heslom', async ({ page }) => {
    const signinPage = new SigninPage(page);

    await signinPage.login(env.userName, 'zle_heslo');
    await signinPage.expectInvalidCredentialsError();
  });

  test('zobrazí validačné chyby pri prázdnych poliach', async ({ page }) => {
    const signinPage = new SigninPage(page);

    await signinPage.triggerUsernameValidation();
    await signinPage.expectUsernameRequiredError();

    await signinPage.triggerPasswordValidation();
    await signinPage.expectPasswordLengthError();
  });
});
